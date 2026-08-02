// ============================================================================
// CLI Exports
// ============================================================================

/**
 * Barrel export for kist's command-line layer.
 *
 * Argument parsing is handled by commander in {@link createProgram}; kist does
 * not parse `process.argv` itself anywhere else, so embedding kist in another
 * program cannot have that program's flags mistaken for kist's.
 *
 * The runnable entry point lives in `../cli.ts` and is deliberately not
 * re-exported here (see the note in `../index.ts`), because importing it would
 * run it.
 */

export { createProgram, runCli } from "./Program.js";
export { buildPlan, formatGraph, formatPlan } from "./Planner.js";
export type { PipelinePlan, StagePlan, StepPlan } from "./Planner.js";
export {
    INIT_TEMPLATES,
    renderTemplate,
    writeInitialConfig,
} from "./InitCommand.js";
export type { InitTemplate } from "./InitCommand.js";
