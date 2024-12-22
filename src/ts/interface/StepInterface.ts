// src/interface/StepInterface.ts


// ============================================================================
// Import
// ============================================================================

import { ActionInterface } from "./ActionInterface";
import { StepOptionsInterface } from "./StepOptionsInterface";


// ============================================================================
// Interfaces
// ============================================================================

/**
 * StepInterface represents a single step within a stage of the packaging
 * pipeline. Each step is defined by a unique name, an action that specifies
 * its behavior, and optional configuration options tailored to that action.
 */
export interface StepInterface {
    /**
     * A unique identifier for the step, used for logging, debugging, and
     * reporting. This name should be descriptive and clearly indicate the
     * purpose of the step.
     */
    name: string;

    /**
     * The action that this step will perform, represented by a class
     * implementing the ActionInterface. This action defines the core
     * functionality of the step, such as building, testing, or deploying.
     * The action is responsible for executing the main logic associated with
     * the step.
     */
    action: ActionInterface;

    /**
     * Optional configuration options specific to the step.
     * These options allow customization of the step's behavior, providing
     * flexibility to adapt the action to different contexts or requirements.
     * For example, build steps might accept options for minification or target
     * environments.
     */
    options?: StepOptionsInterface;

}
