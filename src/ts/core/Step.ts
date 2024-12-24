// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "./AbstractProcess";
import { ActionInterface } from "../interface/ActionInterface";
import { StepInterface } from "../interface/StepInterface";
import { ActionRegistry } from "./ActionRegistry";


// ============================================================================
// Class
// ============================================================================

/**
 * Represents a single step in a stage, encapsulating its execution logic.
 * This class manages the resolution and execution of actions associated
 * with each step.
 */
export class Step extends AbstractProcess {


    // Parameters
    // ========================================================================

    private name: string;
    private action: ActionInterface;
    private options?: Record<string, any>;


    // Constructor
    // ========================================================================

    /**
     * Constructs a Step instance based on the provided step definition.
     * Dynamically resolves the action class from the registry.
     *
     * @param step - The step definition containing the step name, action name,
     * and options.
     * @throws Error if the specified action is not registered in the action
     * registry.
     */
    constructor(step: StepInterface) {
        super(); // Initialize logging
        this.name = step.name;

        // Resolve the action class from the registry using the action name
        // const actionRegistry = ActionRegistry.getInstance();
        // const ActionClass = actionRegistry.getAction(step.action);
        // const ActionClass = actionRegistry.getAction(step.action.constructor.name);
        // if (!ActionClass) {
        //     const errorMessage = `Unknown action "${step.action}" for step "${this.name}". Ensure the action is registered in the registry.`;
        //     this.logError(errorMessage);
        //     throw new Error(errorMessage);
        // }
        // Resolve the action class from the registry using the action name
        const actionRegistry = ActionRegistry.getInstance();
        const ActionClass = actionRegistry.getAction(step.action); // Use action name directly
        if (!ActionClass) {
            this.logError(`Unknown action "${step.action}" for step "${this.name}". Ensure the action is registered in the registry.`);
            throw new Error(`Unknown action "${step.action}" for step "${this.name}". Ensure the action is registered in the registry.`);
        }


        // Initialize the action with the specific class from the registry
        this.action = new ActionClass();
        this.options = step.options;

        this.log(`Step "${this.name}" initialized with action "${step.action.constructor.name}".`);
    }


    // Methods
    // ========================================================================

    /**
     * Executes the step by invoking its action's execute method.
     */
    async execute(): Promise<void> {
        this.log(`Executing step: ${this.name}`);
        try {
            // Validate options if the action provides a validation method
            if (typeof this.action.validateOptions === "function") {
                const isValid = this.action.validateOptions(this.options || {});
                if (!isValid) {
                    throw new Error(`Invalid options for step: ${this.name}`);
                }
            }

            // Execute the action with the provided options
            await this.action.execute(this.options || {});
            this.log(`Step "${this.name}" completed successfully.`);
        } catch (error) {
            this.logError(`Error executing step "${this.name}": ${error}`, error);
        }
    }

}
