/**
 * Barrel export for the structural interfaces that describe a kist pipeline
 * configuration: actions, config files, live-reload options, global/step
 * options, and stages/steps. These are the shapes a `kist.yaml` file (once
 * parsed) and a hand-written {@link ConfigInterface} object must conform to.
 */

export { ActionInterface } from "./ActionInterface.js";
export { ConfigInterface } from "./ConfigInterface.js";
export { LiveOptionsInterface } from "./LiveOptionsInterface.js";
export { OptionsInterface } from "./OptionsInterface.js";
export { StageInterface } from "./StageInterface.js";
export { StepInterface } from "./StepInterface.js";
export { StepOptionsInterface } from "./StepOptionsInterface.js";
