// src/core/BaseAction.ts


// ============================================================================
// Import
// ============================================================================

import { ActionInterface } from '../interface/ActionInterface';
import { ActionOptionsType } from '../types/ActionOptionsType';


// ============================================================================
// Class
// ============================================================================

/**
 * BaseAction provides a common foundation for step actions in the pack.gl pipeline.
 * This class implements the ActionInterface and provides basic structure and utility methods
 * that can be extended by specific actions like BuildAction, LintAction, etc.
 */
export abstract class BaseAction implements ActionInterface {

    /**
     * Provides a basic validation mechanism for action options.
     * Derived classes can override this method to implement specific
     * validation logic.
     * 
     * @param options - The options to validate, ensuring they meet the action's specific requirements.
     * @returns A boolean indicating whether the options are valid. Default implementation always returns true.
     */
    validateOptions(options: ActionOptionsType): boolean {
        // Default validation: always returns true, can be overridden in
        // derived classes
        return true;
    }

    /**
     * Abstract method that must be implemented by derived classes to perform
     * the action's main logic.
     * This method is invoked during the step execution process.
     * 
     * @param options - A structured set of options specific to the action's configuration.
     * @returns A Promise that resolves when the action completes successfully, or rejects with an error if the action fails.
     */
    abstract execute(options: ActionOptionsType): Promise<void>;

    /**
     * Provides a summary or description of the action.
     * This method can be overridden by derived classes to provide more
     * specific details about the action.
     * 
     * @returns A string description of the action.
     */
    describe(): string {
        return 'Base action for executing steps in the pipeline.';
    }

    /**
     * Utility method for logging messages with a consistent format.
     * Can be used by derived classes to standardize logging output during
     * action execution.
     * 
     * @param message - The message to log.
     */
    protected log(message: string): void {
        console.log(`[${this.constructor.name}] ${message}`);
    }

    /**
     * Utility method for logging errors with a consistent format.
     * Can be used by derived classes to standardize error output during action
     * execution.
     * 
     * @param error - The error to log, either as a string or an Error object.
     */
    protected logError(error: string | Error): void {
        console.error(`[${this.constructor.name}] Error:`, error);
    }
}