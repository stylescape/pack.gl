// ============================================================================
// Import
// ============================================================================

import type { ActionInterface } from "../../interface/ActionInterface.js";
import type { StepInterface } from "../../interface/StepInterface.js";
import { ActionError, KistError } from "../../errors/index.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { ActionRegistry } from "./ActionRegistry.js";

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
    private actionName: string;
    private action: ActionInterface;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        this.actionName = String(step.action);
        const ActionClass = actionRegistry.getAction(this.actionName);
        if (!ActionClass) {
            const msg = `
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
            `Step "${this.name}" initialized with action "${this.actionName}".`,
        );
    }

    // Methods
    // ========================================================================

    /**
     * Executes the step by invoking its action's execute method.
     *
     * @throws ActionError if option validation or action execution fails, so
     * the failure propagates to the stage and pipeline instead of being
     * silently swallowed.
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
            if (error instanceof KistError) {
                throw error;
            }
            throw new ActionError(
                this.actionName,
                error instanceof Error ? error.message : String(error),
                { stepName: this.name },
                error instanceof Error ? error : undefined,
            );
        }
    }
}
