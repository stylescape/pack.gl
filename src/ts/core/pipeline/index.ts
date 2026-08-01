// ============================================================================
// Pipeline Exports
// ============================================================================

/**
 * Barrel export for kist's pipeline execution model: the abstract
 * {@link Action} base class actions extend, the {@link ActionRegistry}
 * plugins register into, and the {@link Pipeline} / {@link PipelineManager} /
 * {@link Stage} / {@link Step} classes that make up the run hierarchy — a
 * pipeline runs stages (respecting `dependsOn` and concurrency limits), each
 * stage runs steps, and each step resolves and executes one action.
 */

export { Action } from "./Action.js";
export { ActionRegistry } from "./ActionRegistry.js";
export { Pipeline } from "./Pipeline.js";
export { PipelineManager } from "./PipelineManager.js";
export { Stage } from "./Stage.js";
export { Step } from "./Step.js";
