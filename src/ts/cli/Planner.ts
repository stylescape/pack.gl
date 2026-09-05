// ============================================================================
// Import
// ============================================================================

import type { ConfigInterface } from "../interface/ConfigInterface.js";
import type { StageInterface } from "../interface/StageInterface.js";
import type { StepInterface } from "../interface/StepInterface.js";
import { resolvePipelineOptions } from "../core/config/resolveOptions.js";
import type { ResolvedPipelineOptions } from "../core/config/resolveOptions.js";
import { ActionRegistry } from "../core/pipeline/ActionRegistry.js";

// ============================================================================
// Types
// ============================================================================

/**
 * A step as it would be executed, without executing it.
 */
export interface StepPlan {
    /** The step's name. */
    name: string;

    /** The action it would invoke. */
    action: string;

    /** Whether the action resolves in the current registry. */
    actionResolved: boolean;

    /** False when the step is disabled and would be skipped. */
    enabled: boolean;

    /** Whether the step declares inputs and so participates in caching. */
    cacheable: boolean;

    /** Declared input patterns, if any. */
    inputs?: string[];

    /** Declared output patterns, if any. */
    outputs?: string[];

    /** The timeout that would apply, in milliseconds. Zero means none. */
    timeout: number;

    /** The step's options block. */
    options?: Record<string, unknown>;
}

/**
 * A stage as it would be executed.
 */
export interface StagePlan {
    /** The stage's name. */
    name: string;

    /** False when the stage is disabled and would be skipped. */
    enabled: boolean;

    /** Whether its steps would run concurrently. */
    parallel: boolean;

    /** The scheduling priority that would apply. */
    priority: "low" | "normal" | "high";

    /** Names of stages that must complete first. */
    dependsOn: string[];

    /** The stage's steps, in the order they would run. */
    steps: StepPlan[];
}

/**
 * The full execution plan for a configuration.
 */
export interface PipelinePlan {
    /** Path of the configuration file the plan was built from, if any. */
    configPath?: string;

    /** The settings the run would use. */
    options: ResolvedPipelineOptions;

    /** Whether content-hash caching is on. */
    cacheEnabled: boolean;

    /** Stages in configuration order. */
    stages: StagePlan[];

    /** Actions referenced by the configuration that are not registered. */
    unresolvedActions: string[];
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Builds the execution plan for a configuration without running anything.
 *
 * Backs `--dry-run` and `--dry=json`: it answers "what would this do, in what
 * order, and does every action it names actually exist" — the questions worth
 * answering before a build rather than during one. The JSON form is also the
 * machine-readable interface for CI and for tooling that generates kist
 * configurations.
 *
 * The action registry must already be initialised; unresolved action names are
 * reported rather than thrown, so a plan can show every problem at once.
 *
 * @param config - The merged configuration.
 * @param configPath - Path the configuration was loaded from, for reporting.
 * @returns The plan.
 */
export function buildPlan(
    config: ConfigInterface,
    configPath?: string,
): PipelinePlan {
    const resolved = resolvePipelineOptions(config.options);
    const registry = ActionRegistry.getInstance();
    const registered = new Set(registry.listRegisteredActions());
    const unresolved = new Set<string>();

    const stages = (config.stages ?? []).map(
        (stage: StageInterface): StagePlan => ({
            name: stage.name,
            enabled: stage.enabled ?? true,
            parallel: stage.parallel ?? false,
            priority: stage.priority ?? "normal",
            dependsOn: stage.dependsOn ?? [],
            steps: (stage.steps ?? []).map((step: StepInterface): StepPlan => {
                // A step with no action at all is reported as unresolved
                // rather than carrying `undefined` through the plan, where it
                // rendered as an empty name in the list of unknown actions.
                const action =
                    (typeof step.action === "string"
                        ? step.action
                        : step.action?.name) ?? "(missing)";
                const actionResolved = registered.has(action);
                if (!actionResolved) {
                    unresolved.add(action);
                }

                return {
                    name: step.name,
                    action,
                    actionResolved,
                    enabled: step.enabled ?? true,
                    cacheable: Boolean(
                        config.options?.cache?.enabled &&
                        stage.cacheEnabled !== false &&
                        step.inputs?.length,
                    ),
                    inputs: step.inputs,
                    outputs: step.outputs,
                    timeout: step.timeout ?? resolved.stepTimeout,
                    options: step.options as
                        Record<string, unknown> | undefined,
                };
            }),
        }),
    );

    return {
        configPath,
        options: resolved,
        cacheEnabled: Boolean(config.options?.cache?.enabled),
        stages,
        unresolvedActions: Array.from(unresolved).sort(),
    };
}

/**
 * Renders a plan as an indented, human-readable outline.
 *
 * @param plan - The plan to render.
 * @returns Lines of text, ready to print.
 */
export function formatPlan(plan: PipelinePlan): string {
    const lines: string[] = [];

    lines.push(
        plan.configPath
            ? `Plan for ${plan.configPath}`
            : "Plan for default configuration",
    );
    lines.push(
        `  concurrency: ${
            plan.options.maxConcurrentStages || "unlimited"
        } stage(s)   caching: ${plan.cacheEnabled ? "on" : "off"}   ` +
            `halt on failure: ${plan.options.haltOnFailure ? "yes" : "no"}`,
    );
    lines.push("");

    if (plan.stages.length === 0) {
        lines.push("  (no stages defined)");
    }

    for (const stage of plan.stages) {
        const notes = [
            stage.enabled ? undefined : "disabled",
            stage.parallel ? "parallel" : undefined,
            stage.priority !== "normal"
                ? `priority: ${stage.priority}`
                : undefined,
            stage.dependsOn.length
                ? `after: ${stage.dependsOn.join(", ")}`
                : undefined,
        ].filter(Boolean);

        lines.push(
            `  ${stage.name}${notes.length ? `  [${notes.join(", ")}]` : ""}`,
        );

        for (const step of stage.steps) {
            const stepNotes = [
                step.enabled ? undefined : "disabled",
                step.cacheable ? "cacheable" : undefined,
                step.timeout ? `timeout: ${step.timeout}ms` : undefined,
                step.actionResolved ? undefined : "UNKNOWN ACTION",
            ].filter(Boolean);

            lines.push(
                `    - ${step.name} → ${step.action}` +
                    (stepNotes.length ? `  [${stepNotes.join(", ")}]` : ""),
            );
        }
    }

    if (plan.unresolvedActions.length > 0) {
        lines.push("");
        lines.push(
            `Unresolved actions: ${plan.unresolvedActions.join(", ")}. ` +
                "Install the plugin that provides them, or correct the name.",
        );
    }

    return lines.join("\n");
}

/**
 * Renders the stage dependency graph.
 *
 * Stages with no `dependsOn` edge are independent and may run concurrently;
 * the graph makes that visible, which a linear list of stages does not.
 *
 * @param plan - The plan to render.
 * @param format - "dot" for Graphviz, "mermaid" for Markdown-embeddable output.
 * @returns The graph source.
 */
export function formatGraph(
    plan: PipelinePlan,
    format: "dot" | "mermaid",
): string {
    const id = (name: string): string => name.replace(/[^A-Za-z0-9_]/g, "_");

    if (format === "mermaid") {
        const lines = ["graph TD"];
        for (const stage of plan.stages) {
            lines.push(`    ${id(stage.name)}["${stage.name}"]`);
            for (const dependency of stage.dependsOn) {
                lines.push(`    ${id(dependency)} --> ${id(stage.name)}`);
            }
        }
        return lines.join("\n");
    }

    const lines = ["digraph kist {", "    rankdir=LR;"];
    for (const stage of plan.stages) {
        const style = stage.enabled ? "" : " style=dashed";
        lines.push(`    ${id(stage.name)} [label="${stage.name}"${style}];`);
        for (const dependency of stage.dependsOn) {
            lines.push(`    ${id(dependency)} -> ${id(stage.name)};`);
        }
    }
    lines.push("}");
    return lines.join("\n");
}
