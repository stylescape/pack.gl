// ============================================================================
// Pipeline stage-dependency validation and scheduling
// ============================================================================

import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { BuildCache } from "../src/ts/core/cache/BuildCache";
import { FileCache } from "../src/ts/core/cache/FileCache";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { Pipeline } from "../src/ts/core/pipeline/Pipeline";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import type { StageInterface } from "../src/ts/interface/StageInterface";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import { silenceConsole } from "./helpers/silence";

const order: string[] = [];

class OrderedAction extends Action {
    async execute(options: Record<string, unknown>): Promise<void> {
        order.push(String(options.id));
    }
}

function step(id: string): StepInterface {
    return {
        name: id,
        action: "OrderedAction" as unknown as StepInterface["action"],
        options: { id } as never,
    };
}

function stage(name: string, dependsOn?: string[]): StageInterface {
    return { name, steps: [step(name)], ...(dependsOn ? { dependsOn } : {}) };
}

describe("Pipeline stage dependencies", () => {
    silenceConsole();
    let root: string;

    beforeEach(() => {
        order.length = 0;
        root = mkdtempSync(join(tmpdir(), "kist-deps-"));
        jest.spyOn(process, "cwd").mockReturnValue(root);
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        FileCache.resetInstance();
        BuildCache.resetInstance();
        ActionRegistry.getInstance().registerAction(OrderedAction);
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        FileCache.resetInstance();
        BuildCache.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    // ------------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------------

    describe("validation", () => {
        it("should accept stages with no dependencies", () => {
            expect(
                () => new Pipeline({ stages: [stage("a"), stage("b")] }),
            ).not.toThrow();
        });

        it("should accept a resolvable dependency graph", () => {
            expect(
                () =>
                    new Pipeline({
                        stages: [stage("a"), stage("b", ["a"])],
                    }),
            ).not.toThrow();
        });

        it("should reject a dependency on an unknown stage", () => {
            expect(
                () => new Pipeline({ stages: [stage("a", ["ghost"])] }),
            ).toThrow(/depends on unknown stage "ghost"/);
        });

        it("should reject a direct circular dependency", () => {
            expect(
                () =>
                    new Pipeline({
                        stages: [stage("a", ["b"]), stage("b", ["a"])],
                    }),
            ).toThrow(/circular 'dependsOn' dependency detected/);
        });

        it("should reject a self-referencing stage", () => {
            expect(
                () => new Pipeline({ stages: [stage("a", ["a"])] }),
            ).toThrow(/circular 'dependsOn' dependency detected/);
        });

        it("should reject an indirect cycle", () => {
            expect(
                () =>
                    new Pipeline({
                        stages: [
                            stage("a", ["c"]),
                            stage("b", ["a"]),
                            stage("c", ["b"]),
                        ],
                    }),
            ).toThrow(/circular 'dependsOn' dependency detected/);
        });

        it("should visit a shared dependency only once", () => {
            // `base` is reachable from both `left` and `right`; the second
            // visit must short-circuit on the `visited` set.
            expect(
                () =>
                    new Pipeline({
                        stages: [
                            stage("base"),
                            stage("left", ["base"]),
                            stage("right", ["base"]),
                            stage("top", ["left", "right"]),
                        ],
                    }),
            ).not.toThrow();
        });
    });

    // ------------------------------------------------------------------------
    // Scheduling
    // ------------------------------------------------------------------------

    describe("scheduling", () => {
        it("should run a dependent stage after its dependency", async () => {
            await new Pipeline({
                stages: [stage("second", ["first"]), stage("first")],
            }).run();

            expect(order).toEqual(["first", "second"]);
        });

        it("should respect a chain of dependencies", async () => {
            await new Pipeline({
                stages: [
                    stage("third", ["second"]),
                    stage("second", ["first"]),
                    stage("first"),
                ],
            }).run();

            expect(order).toEqual(["first", "second", "third"]);
        });

        it("should honour the concurrency limit while resolving dependencies", async () => {
            await new Pipeline({
                stages: [
                    stage("a"),
                    stage("b", ["a"]),
                    stage("c", ["a"]),
                    stage("d", ["b", "c"]),
                ],
                options: { performance: { maxConcurrentStages: 1 } },
            }).run();

            expect(order[0]).toBe("a");
            expect(order[order.length - 1]).toBe("d");
            expect(order).toHaveLength(4);
        });

        it("should raise a scheduling error when no stage can start", async () => {
            const pipeline = new Pipeline({
                stages: [stage("a"), stage("b")],
            });
            // Reach past validation to simulate a stalled scheduler: every
            // stage now waits on a dependency that will never complete.
            const internals = pipeline as unknown as {
                config: { stages: StageInterface[] };
            };
            internals.config.stages[0].dependsOn = ["never"];
            internals.config.stages[1].dependsOn = ["never"];

            await expect(pipeline.run()).rejects.toThrow(
                /cannot be scheduled: unresolved dependencies/,
            );
        });
    });
});
