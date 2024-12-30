// ============================================================================
// Import
// ============================================================================

import { AbstractValidator } from "../abstract/AbstractValidator";
import { ActionRegistry } from "../pipeline/ActionRegistry";


// ============================================================================
// Types
// ============================================================================

/**
 * Type representing the structure of action properties for validation.
 */
type ActionValidationKeys = "action";


// ============================================================================
// Class
// ============================================================================

/**
 * Validates actions by ensuring they are registered in the `ActionRegistry`.
 * Extends `AbstractValidator` for consistent validation and logging.
 */
export class ActionValidator extends AbstractValidator<Record<ActionValidationKeys, string>> {

    // Parameters
    // ========================================================================

    private actionRegistry: ActionRegistry;


    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.actionRegistry = ActionRegistry.getInstance();
        this.logInfo("ActionValidator initialized.");
    }


    // Methods
    // ========================================================================

    /**
     * Validates an action object with the structure { action: string }.
     *
     * @param target - The action object to validate.
     * @throws Error if the action is invalid or not registered.
     */
    public validate(target: Record<ActionValidationKeys, string>): void {
        const action = target.action;
        this.logInfo(`Validating action: "${action}"`);

        if (!action || typeof action !== "string") {
            this.throwValidationError(
                "action",
                action,
                "Action name must be a non-empty string."
            );
        }

        const registeredAction = this.actionRegistry.getAction(action);

        if (!registeredAction) {
            this.throwValidationError(
                "action",
                action,
                `Action "${action}" is not registered in the ActionRegistry.`
            );
        }

        this.logValidationSuccess("action", action);
    }

    /**
     * Validates a specific property of the action object.
     * This is required to fulfill the `AbstractValidator` contract.
     *
     * @param key - The property key (e.g., "action").
     * @param value - The value of the property to validate.
     * @throws Error if the validation fails.
     */
    protected validateProperty<K extends keyof Record<ActionValidationKeys, string>>(
        key: K,
        value: Record<ActionValidationKeys, string>[K]
    ): void {
        if (key === "action") {
            this.validate({ action: value });
        } else {
            this.throwValidationError(
                key,
                value,
                `Unknown property key: "${String(key)}".`
            );
        }
    }
}