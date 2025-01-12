// ============================================================================
// Import
// ============================================================================

import { ActionInterface } from "./ActionInterface";
import { StepOptionsInterface } from "./StepOptionsInterface";

// ============================================================================
// Interfaces
// ============================================================================

/**
 * StepInterface defines a single executable unit within a pipeline stage.
 * Each step encapsulates a specific action to be performed, along with
 * configuration options that tailor its behavior. Steps are executed in
 * sequence within their respective stages.
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
    // action: string; // Name of the action to perform (matches registry).

    /**
     * Optional configuration options specific to the step.
     * These options allow customization of the step's behavior, providing
     * flexibility to adapt the action to different contexts or requirements.
     * For example, build steps might accept options for minification or target
     * environments.
     */
    options?: StepOptionsInterface;

    /**
     * An optional flag to enable or disable this step dynamically.
     * - `true`: Step will be executed (default behavior).
     * - `false`: Step will be skipped during execution.
     */
    enabled?: boolean;

    /**
     * Optional timeout for this step, specified in milliseconds.
     * If the step exceeds this duration, it will be forcibly terminated,
     * ensuring the pipeline remains predictable and responsive.
     */
    timeout?: number;

    /**
     * An optional description providing additional context or details about
     * the step. Useful for documentation, reporting, or explaining the
     * purpose of the step to maintainers.
     */
    description?: string;

    /**
     * An optional set of tags to provide metadata for the step.
     * Tags can be used for logging, filtering, or integrating with external
     * tools and systems that require context.
     */
    tags?: Record<string, string>;

    /**
     * Optional hooks to execute custom logic before or after the step.
     * Hooks can be used for additional setup, teardown, or condition checks.
     * - `before`: Function executed before the step runs.
     * - `after`: Function executed after the step completes.
     */
    hooks?: {
        before?: () => Promise<void> | void;
        after?: () => Promise<void> | void;
    };
}
