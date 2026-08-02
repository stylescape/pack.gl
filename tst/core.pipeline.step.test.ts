// ============================================================================
// Step Tests
// ============================================================================

import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { Step } from "../src/ts/core/pipeline/Step";
import { StepCache } from "../src/ts/core/cache/StepCache";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import { ActionError, TimeoutError } from "../src/ts/errors/index";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Test doubles
// ----------------------------------------------------------------------------

let runs = 0;
let failuresRemaining = 0;

/** Succeeds, counting invocations. */
class CountingAction extends Action {
    async execute(): Promise<void> {
        runs++;
    }
}

/** Fails until `failuresRemaining` reaches zero, then succeeds. */
class FlakyAction extends Action {
    async execute(): Promise<void> {
        runs++;
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new Error("transient");
        }
    }
}

/** Never settles, so a timeout is the only way out. */
class HangingAction extends Action {
    async execute(): Promise<void> {
        await new Promise(() => undefined);
    }
}

/** Rejects the options it is given. */
class PickyAction extends Action {
    validateOptions(): boolean {
        return false;
    }
    async execute(): Promise<void> {}
}

/** Writes a file, so cached outputs have something to archive. */
class WritingAction extends Action {
    async execute(options: Record<string, unknown>): Promise<void> {
        runs++;
        writeFileSync(String(options.target), `run-${runs}`, "utf-8");
    }
}

function step(over: Partial<StepInterface> = {}): StepInterface {
    return {
        name: "s",
        action: "CountingAction" as unknown as StepInterface["action"],
        ...over,
    };
}

describe("Step", () => {
    const spies = silenceConsole();

    beforeEach(() => {
        runs = 0;
        failuresRemaining = 0;
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        const registry = ActionRegistry.getInstance();
        registry.registerAction(CountingAction);
        registry.registerAction(FlakyAction);
        registry.registerAction(HangingAction);
        registry.registerAction(PickyAction);
        registry.registerAction(WritingAction);
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        StepCache.resetInstance();
    });

    // ------------------------------------------------------------------------
    // Construction
    // ------------------------------------------------------------------------

    describe("construction", () => {
        it("should reject an unregistered action with a suggestion", () => {
            expect(
                () =>
                    new Step(
                        step({
                            action: "CountingActon" as never,
                        }),
                    ),
            ).toThrow(/Did you mean "CountingAction"\?/);
        });

        it("should point at the plugin package for a migrated action", () => {
            expect(
                () => new Step(step({ action: "LintAction" as never })),
            ).toThrow(/@getkist\/action-eslint/);
        });

        it("should expose its name and action", () => {
            const built = new Step(step({ name: "compile" }));
            expect(built.getName()).toBe("compile");
            expect(built.getActionName()).toBe("CountingAction");
        });

        it("should log a description when one is given", () => {
            new Step(step({ description: "does a thing" }));
            expect(spyOutput(spies.log())).toContain("does a thing");
        });

        it("should log tags when they are given", () => {
            new Step(step({ tags: { owner: "build" } }));
            expect(spyOutput(spies.log())).toContain("tags: owner=build");
        });

        it("should not log an empty tag map", () => {
            new Step(step({ tags: {} }));
            expect(spyOutput(spies.log())).not.toContain("tags:");
        });
    });

    // ------------------------------------------------------------------------
    // enabled
    // ------------------------------------------------------------------------

    describe("enabled", () => {
        it("should run by default", async () => {
            await new Step(step()).execute();
            expect(runs).toBe(1);
        });

        it("should skip when disabled", async () => {
            const built = new Step(step({ enabled: false }));
            await built.execute();

            expect(runs).toBe(0);
            expect(built.isEnabled()).toBe(false);
            expect(spyOutput(spies.log())).toContain(
                'Step "s" is disabled, skipping.',
            );
        });
    });

    // ------------------------------------------------------------------------
    // Hooks
    // ------------------------------------------------------------------------

    describe("hooks", () => {
        it("should run before and after around the action", async () => {
            const order: string[] = [];
            await new Step(
                step({
                    hooks: {
                        before: () => {
                            order.push("before");
                        },
                        after: () => {
                            order.push("after");
                        },
                    },
                }),
            ).execute();

            expect(order).toEqual(["before", "after"]);
            expect(runs).toBe(1);
        });

        it("should await an asynchronous hook", async () => {
            let done = false;
            await new Step(
                step({
                    hooks: {
                        after: async () => {
                            await new Promise((r) => setTimeout(r, 5));
                            done = true;
                        },
                    },
                }),
            ).execute();

            expect(done).toBe(true);
        });

        it("should fail the step when a hook throws", async () => {
            await expect(
                new Step(
                    step({
                        hooks: {
                            before: () => {
                                throw new Error("hook down");
                            },
                        },
                    }),
                ).execute(),
            ).rejects.toThrow(ActionError);

            expect(runs).toBe(0);
        });

        it("should run neither hook when none are declared", async () => {
            await expect(new Step(step()).execute()).resolves.toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // Timeout
    // ------------------------------------------------------------------------

    describe("timeout", () => {
        it("should fail a step that exceeds its own timeout", async () => {
            await expect(
                new Step(
                    step({ action: "HangingAction" as never, timeout: 20 }),
                ).execute(),
            ).rejects.toThrow(TimeoutError);
        });

        it("should apply the pipeline default when the step sets none", async () => {
            await expect(
                new Step(step({ action: "HangingAction" as never }), {
                    defaultTimeout: 20,
                }).execute(),
            ).rejects.toThrow(TimeoutError);
        });

        it("should let the step's own timeout win over the default", async () => {
            // A generous step timeout must not be cut short by a small default.
            await expect(
                new Step(step({ timeout: 5000 }), {
                    defaultTimeout: 1,
                }).execute(),
            ).resolves.toBeUndefined();
        });

        it("should not apply a timeout of zero", async () => {
            await expect(
                new Step(step(), { defaultTimeout: 0 }).execute(),
            ).resolves.toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // Retries
    // ------------------------------------------------------------------------

    describe("retries", () => {
        it("should not retry by default", async () => {
            failuresRemaining = 1;
            await expect(
                new Step(step({ action: "FlakyAction" as never })).execute(),
            ).rejects.toThrow(ActionError);

            expect(runs).toBe(1);
        });

        it("should retry up to the configured count", async () => {
            failuresRemaining = 2;
            await new Step(step({ action: "FlakyAction" as never }), {
                retries: 2,
            }).execute();

            expect(runs).toBe(3);
        });

        it("should give up after the last attempt", async () => {
            failuresRemaining = 5;
            await expect(
                new Step(step({ action: "FlakyAction" as never }), {
                    retries: 1,
                }).execute(),
            ).rejects.toThrow(ActionError);

            expect(runs).toBe(2);
        });

        it("should wait between attempts when a delay is configured", async () => {
            failuresRemaining = 1;
            const started = Date.now();

            await new Step(step({ action: "FlakyAction" as never }), {
                retries: 1,
                retryDelay: 30,
            }).execute();

            expect(Date.now() - started).toBeGreaterThanOrEqual(25);
        });

        it("should report each retry", async () => {
            failuresRemaining = 1;
            await new Step(step({ action: "FlakyAction" as never }), {
                retries: 1,
            }).execute();

            expect(spyOutput(spies.warn())).toContain(
                'Step "s" failed (attempt 1 of 2), retrying',
            );
        });

        it("should treat a negative retry count as none", async () => {
            failuresRemaining = 1;
            await expect(
                new Step(step({ action: "FlakyAction" as never }), {
                    retries: -3,
                }).execute(),
            ).rejects.toThrow(ActionError);

            expect(runs).toBe(1);
        });
    });

    // ------------------------------------------------------------------------
    // Option validation
    // ------------------------------------------------------------------------

    describe("option validation", () => {
        it("should fail when the action rejects its options", async () => {
            await expect(
                new Step(step({ action: "PickyAction" as never })).execute(),
            ).rejects.toThrow(/Invalid options for step/);
        });
    });

    // ------------------------------------------------------------------------
    // Caching
    // ------------------------------------------------------------------------

    describe("caching", () => {
        let root: string;
        let cache: StepCache;

        beforeEach(() => {
            root = mkdtempSync(join(tmpdir(), "kist-step-"));
            mkdirSync(join(root, "src"), { recursive: true });
            writeFileSync(join(root, "src", "in.txt"), "one", "utf-8");
            StepCache.resetInstance();
            cache = StepCache.getInstance({ cwd: root, cacheDir: ".cache" });
        });

        afterEach(() => rmSync(root, { recursive: true, force: true }));

        /** A step that reads src/in.txt and writes out.txt. */
        function cachedStep(): StepInterface {
            return step({
                action: "WritingAction" as never,
                options: { target: join(root, "out.txt") } as never,
                inputs: ["src/in.txt"],
                outputs: ["out.txt"],
            });
        }

        it("should run the first time and skip the second", async () => {
            await new Step(cachedStep(), { cache }).execute();
            expect(runs).toBe(1);

            await new Step(cachedStep(), { cache }).execute();
            expect(runs).toBe(1);
            expect(spyOutput(spies.log())).toContain(
                'Step "s" is up to date (cache hit)',
            );
        });

        it("should re-run when an input changes", async () => {
            await new Step(cachedStep(), { cache }).execute();
            writeFileSync(join(root, "src", "in.txt"), "two", "utf-8");
            await new Step(cachedStep(), { cache }).execute();

            expect(runs).toBe(2);
        });

        it("should re-run when the options change", async () => {
            await new Step(cachedStep(), { cache }).execute();

            const changed = cachedStep();
            changed.options = { target: join(root, "other.txt") } as never;
            await new Step(changed, { cache }).execute();

            expect(runs).toBe(2);
        });

        it("should replay the original output on a hit", async () => {
            await new Step(cachedStep(), { cache }).execute();
            const first = spyOutput(spies.log());
            expect(first).toContain('Step "s" completed successfully.');

            spies.log().mockClear();
            await new Step(cachedStep(), { cache }).execute();

            // The replayed run reproduces the completion line from the first.
            expect(spyOutput(spies.log())).toContain(
                'Step "s" completed successfully.',
            );
        });

        it("should always run a step that declares no inputs", async () => {
            const uncacheable = step({
                action: "WritingAction" as never,
                options: { target: join(root, "out.txt") } as never,
                outputs: ["out.txt"],
            });

            await new Step(uncacheable, { cache }).execute();
            await new Step(uncacheable, { cache }).execute();

            expect(runs).toBe(2);
        });

        it("should always run when no cache is supplied", async () => {
            await new Step(cachedStep()).execute();
            await new Step(cachedStep()).execute();

            expect(runs).toBe(2);
        });

        it("should not record a step that failed", async () => {
            failuresRemaining = 1;
            const failing = step({
                action: "FlakyAction" as never,
                inputs: ["src/in.txt"],
            });

            await expect(
                new Step(failing, { cache }).execute(),
            ).rejects.toThrow(ActionError);

            // The next run must execute rather than replaying a failure.
            failuresRemaining = 0;
            await new Step(failing, { cache }).execute();
            expect(runs).toBe(2);
        });
    });
});
