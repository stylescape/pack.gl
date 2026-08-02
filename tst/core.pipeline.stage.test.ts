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

    // ------------------------------------------------------------------------
    // Metadata
    // ------------------------------------------------------------------------

    describe("metadata", () => {
        it("should expose its name and steps", () => {
            const built = new Stage(stage());
            expect(built.getName()).toBe("build");
            expect(built.getSteps()).toHaveLength(2);
        });

        it("should report whether it is enabled", () => {
            expect(new Stage(stage()).isEnabled()).toBe(true);
            expect(new Stage(stage({ enabled: false })).isEnabled()).toBe(
                false,
            );
        });

        it("should default to normal priority", () => {
            expect(new Stage(stage()).getPriority()).toBe("normal");
        });

        it("should report the configured priority", () => {
            expect(new Stage(stage({ priority: "high" })).getPriority()).toBe(
                "high",
            );
        });

        it("should treat caching as inherited unless disabled", () => {
            expect(new Stage(stage()).isCacheEnabled()).toBe(true);
            expect(
                new Stage(stage({ cacheEnabled: false })).isCacheEnabled(),
            ).toBe(false);
        });

        it("should log a description when one is given", () => {
            new Stage(stage({ description: "compiles things" }));
            expect(spyOutput(spies.log())).toContain("compiles things");
        });

        it("should log tags when they are given", () => {
            new Stage(stage({ tags: { team: "build" } }));
            expect(spyOutput(spies.log())).toContain("tags: team=build");
        });

        it("should not log an empty tag map", () => {
            new Stage(stage({ tags: {} }));
            expect(spyOutput(spies.log())).not.toContain("tags:");
        });
    });

    // ------------------------------------------------------------------------
    // Hooks
    // ------------------------------------------------------------------------

    describe("hooks", () => {
        it("should run before and after around the steps", async () => {
            const order: string[] = [];

            await new Stage(
                stage({
                    hooks: {
                        before: () => {
                            order.push("before");
                        },
                        after: () => {
                            order.push("after");
                        },
                    },
                }),
            ).execute(new Set());

            expect(order).toEqual(["before", "after"]);
            expect(trace).toContain("end:b");
        });

        it("should await an asynchronous hook", async () => {
            let done = false;

            await new Stage(
                stage({
                    hooks: {
                        after: async () => {
                            await new Promise((r) => setTimeout(r, 5));
                            done = true;
                        },
                    },
                }),
            ).execute(new Set());

            expect(done).toBe(true);
        });

        it("should fail the stage when a hook throws", async () => {
            await expect(
                new Stage(
                    stage({
                        hooks: {
                            before: () => {
                                throw new Error("hook down");
                            },
                        },
                    }),
                ).execute(new Set()),
            ).rejects.toThrow("hook down");

            // The steps must not have run.
            expect(trace).toEqual([]);
        });
    });

    // ------------------------------------------------------------------------
    // Step concurrency inherited from the pipeline
    // ------------------------------------------------------------------------

    describe("step concurrency", () => {
        it("should use the pipeline default when the stage sets none", async () => {
            delays.set("a", 20);
            delays.set("b", 20);

            await new Stage(stage({ parallel: true }), {
                maxConcurrentSteps: 1,
            }).execute(new Set());

            expect(peakConcurrent).toBe(1);
        });

        it("should let the stage's own limit win", async () => {
            delays.set("a", 20);
            delays.set("b", 20);

            await new Stage(stage({ parallel: true, maxConcurrentSteps: 2 }), {
                maxConcurrentSteps: 1,
            }).execute(new Set());

            expect(peakConcurrent).toBe(2);
        });
    });
});
