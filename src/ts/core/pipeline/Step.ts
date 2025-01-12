// ============================================================================
// Import
// ============================================================================

import { ActionInterface } from "../../interface/ActionInterface";
import { StepInterface } from "../../interface/StepInterface";
import { AbstractProcess } from "../abstract/AbstractProcess";
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
        super();
        this.name = step.name;

        // Resolve the action class from the registry using the action name
        const actionRegistry = ActionRegistry.getInstance();
        // console.log(step.action)
        // const ActionClass = actionRegistry.getAction(step.action.name);
        const ActionClass = actionRegistry.getAction(String(step.action));
        if (!ActionClass) {
            let msg = `
                Unknown action "${step.action}" for step "${this.name}".
                Ensure the action is registered in the registry.
                `;
            this.logError(msg);
            throw new Error(msg);
        }

        // Initialize the action with the specific class from the registry
        this.action = new ActionClass();
        this.options = step.options;

        this.logInfo(
            `Step "${this.name}" initialized with action "${step.action.constructor.name}".`,
        );
    }

    // Methods
    // ========================================================================

    /**
     * Executes the step by invoking its action's execute method.
     */
    async execute(): Promise<void> {
        this.logInfo(`Executing step: ${this.name}`);

        try {
            // Validate options if the action provides a validation method
            if (typeof this.action.validateOptions === "function") {
                const isValid = this.action.validateOptions(
                    this.options || {},
                );
                if (!isValid) {
                    throw new Error(`Invalid options for step: ${this.name}`);
                }
            }

            // Execute the action with the provided options
            await this.action.execute(this.options || {});
            this.logInfo(`Step "${this.name}" completed successfully.`);
        } catch (error) {
            this.logError(
                `Error executing step "${this.name}": ${error}`,
                error,
            );
        }
    }
}
