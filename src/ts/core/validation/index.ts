// ============================================================================
// Validation Exports
// ============================================================================

/**
 * Barrel export for kist's structural configuration validators:
 * {@link ConfigValidator} validates a whole parsed config, delegating to
 * {@link StageValidator} per stage, which delegates to {@link StepValidator}
 * per step, which delegates to {@link ActionValidator} to confirm the named
 * action is registered. `Kist.validateConfiguration` (in `../../kist.ts`)
 * runs this chain against the merged {@link ConfigStore} config on every
 * `run()`, after the ActionRegistry is initialized so action names can be
 * checked. {@link OptionsValidator} is used separately, by the CLI's
 * `ArgumentParser` to validate individual `--flag value` pairs as they are
 * parsed.
 */

export { ActionValidator } from "./ActionValidator.js";
export { ConfigValidator } from "./ConfigValidator.js";
export { OptionsValidator } from "./OptionsValidator.js";
export { StageValidator } from "./StageValidator.js";
export { StepValidator } from "./StepValidator.js";
