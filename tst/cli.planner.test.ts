// ============================================================================
// Planner Tests
// ============================================================================

import { buildPlan, formatGraph, formatPlan } from "../src/ts/cli/Planner";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import type { ConfigInterface } from "../src/ts/interface/ConfigInterface";
import { silenceConsole } from "./helpers/silence";

class NoopAction extends Action {
    async execute(): Promise<void> {}
}

/** A second registered action, so plans can reference more than one. */
class OtherAction extends Action {
    async execute(): Promise<void> {}
}

describe("Planner", () => {
    silenceConsole();

    beforeEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        const registry = ActionRegistry.getInstance();
        registry.registerAction(NoopAction);
        registry.registerAction(OtherAction);
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    /** A configuration with two dependent stages. */
    function config(over: Partial<ConfigInterface> = {}): ConfigInterface {
        return {
            stages: [
                {
                    name: "build",
                    steps: [{ name: "compile", action: "NoopAction" }],
                },
                {
                    name: "publish",
                    dependsOn: ["build"],
                    steps: [{ name: "upload", action: "OtherAction" }],
                },
            ],
            ...over,
        };
    }

    // ------------------------------------------------------------------------
    // buildPlan
    // ------------------------------------------------------------------------

    describe("buildPlan", () => {
        it("should mirror the stages and steps in order", () => {
            const plan = buildPlan(config());

            expect(plan.stages.map((s) => s.name)).toEqual([
                "build",
                "publish",
            ]);
            expect(plan.stages[1].dependsOn).toEqual(["build"]);
            expect(plan.stages[0].steps[0]).toMatchObject({
                name: "compile",
                action: "NoopAction",
                actionResolved: true,
                enabled: true,
            });
        });

        it("should record the configuration path when given", () => {
            expect(buildPlan(config(), "/p/kist.yml").configPath).toBe(
                "/p/kist.yml",
            );
        });

        it("should apply defaults for optional stage fields", () => {
            const plan = buildPlan(config());

            expect(plan.stages[0]).toMatchObject({
                enabled: true,
                parallel: false,
                priority: "normal",
            });
        });

        it("should report a disabled stage and step", () => {
            const plan = buildPlan({
                stages: [
                    {
                        name: "build",
                        enabled: false,
                        steps: [
                            {
                                name: "compile",
                                action: "NoopAction",
                                enabled: false,
                            },
                        ],
                    },
                ],
            });

            expect(plan.stages[0].enabled).toBe(false);
            expect(plan.stages[0].steps[0].enabled).toBe(false);
        });

        it("should collect unresolved action names without throwing", () => {
            const plan = buildPlan({
                stages: [
                    {
                        name: "s",
                        steps: [
                            { name: "a", action: "MissingAction" },
                            { name: "b", action: "AlsoMissing" },
                        ],
                    },
                ],
            });

            expect(plan.unresolvedActions).toEqual([
                "AlsoMissing",
                "MissingAction",
            ]);
            expect(plan.stages[0].steps[0].actionResolved).toBe(false);
        });

        it("should accept an action supplied as an object", () => {
            const plan = buildPlan({
                stages: [
                    {
                        name: "s",
                        steps: [
                            {
                                name: "a",
                                action: {
                                    name: "NoopAction",
                                } as never,
                            },
                        ],
                    },
                ],
            });

            expect(plan.stages[0].steps[0].actionResolved).toBe(true);
        });

        it("should mark a step cacheable only when caching is on and inputs are declared", () => {
            const withCache = buildPlan({
                options: { cache: { enabled: true } },
                stages: [
                    {
                        name: "s",
                        steps: [
                            {
                                name: "a",
                                action: "NoopAction",
                                inputs: ["src/**"],
                            },
                            { name: "b", action: "NoopAction" },
                        ],
                    },
                ],
            });

            expect(withCache.cacheEnabled).toBe(true);
            expect(withCache.stages[0].steps[0].cacheable).toBe(true);
            expect(withCache.stages[0].steps[1].cacheable).toBe(false);
        });

        it("should mark steps uncacheable when the stage opts out", () => {
            const plan = buildPlan({
                options: { cache: { enabled: true } },
                stages: [
                    {
                        name: "s",
                        cacheEnabled: false,
                        steps: [
                            {
                                name: "a",
                                action: "NoopAction",
                                inputs: ["src/**"],
                            },
                        ],
                    },
                ],
            });

            expect(plan.stages[0].steps[0].cacheable).toBe(false);
        });

        it("should mark steps uncacheable when caching is off globally", () => {
            const plan = buildPlan({
                stages: [
                    {
                        name: "s",
                        steps: [
                            {
                                name: "a",
                                action: "NoopAction",
                                inputs: ["src/**"],
                            },
                        ],
                    },
                ],
            });

            expect(plan.cacheEnabled).toBe(false);
            expect(plan.stages[0].steps[0].cacheable).toBe(false);
        });

        it("should fall back to the pipeline timeout for a step without one", () => {
            const plan = buildPlan({
                options: { pipeline: { stepTimeout: 1500 } },
                stages: [
                    {
                        name: "s",
                        steps: [
                            { name: "a", action: "NoopAction" },
                            {
                                name: "b",
                                action: "NoopAction",
                                timeout: 10,
                            },
                        ],
                    },
                ],
            });

            expect(plan.stages[0].steps[0].timeout).toBe(1500);
            expect(plan.stages[0].steps[1].timeout).toBe(10);
        });

        it("should handle a configuration with no stages", () => {
            expect(buildPlan({ stages: [] }).stages).toEqual([]);
        });

        it("should handle a stage with no steps", () => {
            const plan = buildPlan({
                stages: [{ name: "empty", steps: undefined as never }],
            });

            expect(plan.stages[0].steps).toEqual([]);
        });

        it("should handle a configuration with no stages key at all", () => {
            const plan = buildPlan({} as ConfigInterface);
            expect(plan.stages).toEqual([]);
        });
    });

    // ------------------------------------------------------------------------
    // formatPlan
    // ------------------------------------------------------------------------

    describe("formatPlan", () => {
        it("should list every stage and step", () => {
            const text = formatPlan(buildPlan(config(), "/p/kist.yml"));

            expect(text).toContain("Plan for /p/kist.yml");
            expect(text).toContain("build");
            expect(text).toContain("- compile → NoopAction");
            expect(text).toContain("after: build");
        });

        it("should say so when no configuration file was found", () => {
            expect(formatPlan(buildPlan({ stages: [] }))).toContain(
                "Plan for default configuration",
            );
        });

        it("should note an empty pipeline", () => {
            expect(formatPlan(buildPlan({ stages: [] }))).toContain(
                "(no stages defined)",
            );
        });

        it("should describe unlimited concurrency in words", () => {
            expect(formatPlan(buildPlan(config()))).toContain(
                "concurrency: unlimited",
            );
        });

        it("should report a concurrency limit", () => {
            const plan = buildPlan(
                config({
                    options: { performance: { maxConcurrentStages: 2 } },
                }),
            );
            expect(formatPlan(plan)).toContain("concurrency: 2 stage(s)");
        });

        it("should annotate parallel, disabled, and prioritised stages", () => {
            const plan = buildPlan({
                stages: [
                    {
                        name: "s",
                        parallel: true,
                        enabled: false,
                        priority: "high",
                        steps: [],
                    },
                ],
            });

            const text = formatPlan(plan);
            expect(text).toContain("disabled");
            expect(text).toContain("parallel");
            expect(text).toContain("priority: high");
        });

        it("should annotate disabled, cacheable, and timed steps", () => {
            const plan = buildPlan({
                options: { cache: { enabled: true } },
                stages: [
                    {
                        name: "s",
                        steps: [
                            {
                                name: "a",
                                action: "NoopAction",
                                enabled: false,
                                inputs: ["x"],
                                timeout: 50,
                            },
                        ],
                    },
                ],
            });

            const text = formatPlan(plan);
            expect(text).toContain("disabled");
            expect(text).toContain("cacheable");
            expect(text).toContain("timeout: 50ms");
        });

        it("should flag an unknown action inline and in a summary", () => {
            const plan = buildPlan({
                stages: [
                    { name: "s", steps: [{ name: "a", action: "Nope" }] },
                ],
            });

            const text = formatPlan(plan);
            expect(text).toContain("UNKNOWN ACTION");
            expect(text).toContain("Unresolved actions: Nope");
        });

        it("should report halt-on-failure being off", () => {
            const plan = buildPlan(
                config({ options: { haltOnFailure: false } }),
            );
            expect(formatPlan(plan)).toContain("halt on failure: no");
        });
    });

    // ------------------------------------------------------------------------
    // formatGraph
    // ------------------------------------------------------------------------

    describe("formatGraph", () => {
        it("should render Graphviz DOT with an edge per dependency", () => {
            const dot = formatGraph(buildPlan(config()), "dot");

            expect(dot).toContain("digraph kist {");
            expect(dot).toContain('build [label="build"]');
            expect(dot).toContain("build -> publish;");
            expect(dot.trim().endsWith("}")).toBe(true);
        });

        it("should render mermaid with an edge per dependency", () => {
            const mermaid = formatGraph(buildPlan(config()), "mermaid");

            expect(mermaid).toContain("graph TD");
            expect(mermaid).toContain('build["build"]');
            expect(mermaid).toContain("build --> publish");
        });

        it("should mark disabled stages in DOT", () => {
            const plan = buildPlan({
                stages: [{ name: "off", enabled: false, steps: [] }],
            });

            expect(formatGraph(plan, "dot")).toContain("style=dashed");
        });

        it("should make identifiers safe while keeping labels intact", () => {
            const plan = buildPlan({
                stages: [{ name: "build & test", steps: [] }],
            });

            const dot = formatGraph(plan, "dot");
            expect(dot).toContain('build___test [label="build & test"]');
        });
    });
});
