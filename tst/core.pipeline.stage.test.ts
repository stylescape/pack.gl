// ============================================================================
// Stage Tests
// ============================================================================

import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { Stage } from "../src/ts/core/pipeline/Stage";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import type { StageInterface } from "../src/ts/interface/StageInterface";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Test doubles
// ----------------------------------------------------------------------------

/** Records the order in which steps run and how long each one takes. */
const trace: string[] = [];
let concurrent = 0;
let peakConcurrent = 0;
const delays = new Map<string, number>();

class TracingAction extends Action {
    async execute(options: Record<string, unknown>): Promise<void> {
        const id = String(options.id ?? "anonymous");
        concurrent++;
        peakConcurrent = Math.max(peakConcurrent, concurrent);
        trace.push(`start:${id}`);
        await new Promise((resolve) =>
            setTimeout(resolve, delays.get(id) ?? 0),
        );
        trace.push(`end:${id}`);
        concurrent--;
    }
}

/** Throws out of `Stage.execute` rather than being swallowed by `Step`. */
class NeverResolvingAction extends Action {
    async execute(): Promise<void> {
        await new Promise(() => undefined);
    }
}

function step(id: string): StepInterface {
    return {
        name: id,
        action: "TracingAction" as unknown as StepInterface["action"],
        options: { id } as never,
    };
}

function stage(over: Partial<StageInterface> = {}): StageInterface {
    return { name: "build", steps: [step("a"), step("b")], ...over };
}

describe("Stage", () => {
    const spies = silenceConsole();

    beforeEach(() => {
        trace.length = 0;
        concurrent = 0;
        peakConcurrent = 0;
        delays.clear();
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        const registry = ActionRegistry.getInstance();
        registry.registerAction(TracingAction);
        registry.registerAction(NeverResolvingAction);
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    // ------------------------------------------------------------------------
    // Construction
    // ------------------------------------------------------------------------

    describe("construction", () => {
        it("should build one Step per definition", () => {
            new Stage(stage());
            expect(spyOutput(spies.log())).toContain(
                'Stage "build" initialized with 2 steps.',
            );
        });

        it("should note parallel mode in the initialization log", () => {
            new Stage(stage({ parallel: true }));
            expect(spyOutput(spies.log())).toContain(
                'Stage "build" initialized with 2 steps (parallel).',
            );
        });
    });

    // ------------------------------------------------------------------------
    // Sequential execution
    // ------------------------------------------------------------------------

    describe("sequential execution", () => {
        it("should run steps one after another", async () => {
            const completed = new Set<string>();
            await new Stage(stage()).execute(completed);

            expect(trace).toEqual(["start:a", "end:a", "start:b", "end:b"]);
            expect(completed.has("build")).toBe(true);
        });

        it("should report the elapsed time", async () => {
            await new Stage(stage()).execute(new Set());
            expect(spyOutput(spies.log())).toMatch(
                /Stage "build" completed successfully in [\d.]+ms/,
            );
        });
    });

    // ------------------------------------------------------------------------
    // Disabled stages
    // ------------------------------------------------------------------------

    describe("disabled stages", () => {
        it("should skip execution and mark itself complete", async () => {
            const completed = new Set<string>();
            await new Stage(stage({ enabled: false })).execute(completed);

            expect(trace).toEqual([]);
            expect(completed.has("build")).toBe(true);
            expect(spyOutput(spies.log())).toContain(
                'Stage "build" is disabled, skipping.',
            );
        });

        it("should run when explicitly enabled", async () => {
            await new Stage(stage({ enabled: true })).execute(new Set());
            expect(trace).toContain("start:a");
        });
    });

    // ------------------------------------------------------------------------
    // Parallel execution
    // ------------------------------------------------------------------------

    describe("parallel execution", () => {
        it("should run all steps simultaneously without a limit", async () => {
            delays.set("a", 20);
            delays.set("b", 20);

            await new Stage(stage({ parallel: true })).execute(new Set());

            expect(peakConcurrent).toBe(2);
            expect(spyOutput(spies.log())).toContain(
                "Executing stage: build (parallel mode)",
            );
        });

        it("should ignore a concurrency cap that exceeds the step count", async () => {
            delays.set("a", 20);
            delays.set("b", 20);

            await new Stage(
                stage({ parallel: true, maxConcurrentSteps: 10 }),
            ).execute(new Set());

            expect(peakConcurrent).toBe(2);
        });

        it("should honour a concurrency cap below the step count", async () => {
            const steps = ["a", "b", "c", "d"].map(step);
            steps.forEach((s) => delays.set(s.name, 20));

            await new Stage(
                stage({ steps, parallel: true, maxConcurrentSteps: 2 }),
            ).execute(new Set());

            expect(peakConcurrent).toBeLessThanOrEqual(2);
            expect(trace.filter((e) => e.startsWith("end:"))).toHaveLength(4);
        });
    });

    // ------------------------------------------------------------------------
    // Dependencies
    // ------------------------------------------------------------------------

    describe("dependencies", () => {
        it("should run immediately when dependencies are already complete", async () => {
            const completed = new Set<string>(["setup"]);
            await new Stage(stage({ dependsOn: ["setup"] })).execute(
                completed,
            );

            expect(trace).toContain("end:b");
            expect(spyOutput(spies.log())).toContain(
                'All dependencies resolved for stage: "build"',
            );
        });

        it("should wait until a pending dependency completes", async () => {
            const completed = new Set<string>();
            const pending = new Stage(stage({ dependsOn: ["setup"] })).execute(
                completed,
            );

            // Nothing may run while the dependency is outstanding.
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(trace).toEqual([]);

            completed.add("setup");
            await pending;
            expect(trace).toContain("end:b");
        });

        it("should run without waiting when no dependencies are declared", async () => {
            await new Stage(stage({ dependsOn: undefined })).execute(
                new Set(),
            );
            expect(trace).toContain("end:a");
        });

        it("should treat an empty dependency list as satisfied", async () => {
            await new Stage(stage({ dependsOn: [] })).execute(new Set());
            expect(trace).toContain("end:a");
        });
    });

    // ------------------------------------------------------------------------
    // Timeouts
    // ------------------------------------------------------------------------

    describe("timeouts", () => {
        it("should complete normally when it finishes inside the timeout", async () => {
            // Kept short on purpose: `executeWithTimeout` never clears its
            // timer, so a large value here would outlive the test run.
            await new Stage(stage({ timeout: 100 })).execute(new Set());
            expect(trace).toContain("end:b");
        });

        it("should reject and log when the timeout elapses", async () => {
            const stalled = new Stage(
                stage({
                    steps: [
                        {
                            name: "stall",
                            action: "NeverResolvingAction" as unknown as StepInterface["action"],
                        },
                    ],
                    timeout: 20,
                }),
            );

            await expect(stalled.execute(new Set())).rejects.toThrow(
                'Stage "build" timed out after 20ms',
            );
            expect(spyOutput(spies.error())).toContain(
                'Error executing stage "build"',
            );
        });
    });
});
