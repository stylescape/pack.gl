// src/core/Step.ts


// ============================================================================
// Import
// ============================================================================

import { ActionInterface } from '../interface/ActionInterface';
import { StepInterface } from '../interface/StepInterface';
import { getAction } from './ActionRegistry';


// ============================================================================
// Class
// ============================================================================

/**
 * Represents a single step in a stage, encapsulating its execution logic.
 * This class manages the resolution and execution of actions associated with each step.
 */
export class Step {
    private name: string;
    private action: ActionInterface;
    private options?: Record<string, any>;

    /**
     * Constructs a Step instance with the given step definition.
     * Dynamically resolves the action class from the registry based on the action name.
     * @param step - The step definition containing name, action, and options.
     */
    constructor(step: StepInterface) {
        this.name = step.name;
        
        // Resolve the action class from the registry using the action name
        const ActionClass = getAction(step.action.constructor.name); 
        if (!ActionClass) {
            throw new Error(`Unknown action: ${step.action.constructor.name}. Please ensure it is registered.`);
        }
        
        // Initialize the action with the specific class from the registry
        this.action = new ActionClass();
        this.options = step.options;
    }

    /**
     * Executes the step by invoking its action's execute method.
     */
    async execute(): Promise<void> {
        console.log(`Running step: ${this.name}`);
        try {
            // Validate options if the action provides a validation method
            if (typeof this.action.validateOptions === 'function') {
                const isValid = this.action.validateOptions(this.options || {});
                if (!isValid) {
                    throw new Error(`Invalid options for step: ${this.name}`);
                }
            }

            // Execute the action with the provided options
            await this.action.execute(this.options || {});
            console.log(`Step ${this.name} completed successfully.`);
        } catch (error) {
            console.error(`Error executing step ${this.name}:`, error);
        }
    }
}
