// src/interface/ActionInterface.ts


// ============================================================================
// Import
// ============================================================================

import { ActionOptionsType } from "../types/ActionOptionsType";


// ============================================================================
// Interfaces
// ============================================================================

/**
 * ActionInterface defines the contract for step action classes in pack.gl.
 * Implementing this interface allows actions to be dynamically integrated into
 * the pipeline, offering a flexible and extensible system for defining custom
 * behaviors within different stages.
 */
export interface ActionInterface {
    /**
     * Executes the action with the provided options.
     * Implementations of this method should perform the main logic of the
     * action, such as building, testing, linting, packaging, or other
     * custom-defined processes.
     * 
     * @param options - A structured set of options specific to the action's
     *                  configuration. Implementations are responsible for
     *                  validating and applying these options.
     *                  Example configurations might include:
     *                  - For 'build': { minify: boolean, sourceMap: boolean, target: string }
     *                  - For 'lint': { fix: boolean, formatter: string }
     * @returns A Promise that resolves when the action completes successfully, or rejects with an error if the action fails.
     */
    execute(options: ActionOptionsType): Promise<void>;

    /**
     * Validates the provided options before execution.
     * This method can be used to check the integrity and correctness of the
     * options object, ensuring that required fields are present and valid.
     * 
     * @param options - The options to validate, ensuring they meet the
     *      action's specific requirements.
     * @returns A boolean indicating whether the options are valid. Throws an
     *      error or returns false if validation fails.
     */
    validateOptions?(options: ActionOptionsType): boolean;

    /**
     * Provides a summary or description of the action.
     * This can be used for logging, debugging, or documentation purposes to
     * describe what the action does.
     * 
     * @returns A string description of the action.
     */
    describe?(): string;
}
