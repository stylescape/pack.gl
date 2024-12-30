// ============================================================================
// Import
// ============================================================================

import { AbstractValidator } from "../abstract/AbstractValidator";
import { StepInterface } from "../../interface/StepInterface";
import { ActionValidator } from "./ActionValidator";
import { StepOptionsInterface } from "../../interface/StepOptionsInterface";


// ============================================================================
// Class
// ============================================================================

/**
 * Validates individual steps within a stage.
 * Ensures steps conform to the expected structure and all associated
 * actions are valid.
 */
export class StepValidator extends AbstractValidator<StepInterface> {

    // Parameters
    // ========================================================================

    private actionValidator: ActionValidator;


    // Constructor
    // ========================================================================

    /**
     * Initializes the StepValidator.
     * Creates an instance of `ActionValidator` for validating actions.
     */
    constructor() {
        super();
        this.actionValidator = new ActionValidator();
        this.logInfo("StepValidator initialized.");
    }


    // Methods
    // ========================================================================

    /**
     * Validates an entire step object.
     * 
     * @param step - The step object to validate.
     * @throws Error if the step or any of its properties are invalid.
     */
    public validate(step: StepInterface): void {
        this.logInfo(`Validating step: "${step.name}"`);

        this.validateProperty("name", step.name);
        this.validateActions(step.action); // Validate the action object
        if (step.options) {
            this.validateProperty("options", step.options);
        }

        this.logInfo(`Step "${step.name}" validated successfully.`);
    }

    /**
     * Validates a specific property of a step.
     * 
     * @param key - The property key to validate (e.g., "name", "action").
     * @param value - The property value to validate.
     * @throws Error if validation fails.
     */
    public validateProperty<K extends keyof StepInterface>(
        key: K,
        value: StepInterface[K]
    ): void {
        switch (key) {
            case "name":
                this.validateName(value as string);
                break;
            case "options":
                this.validateOptions(value as Record<string, any>);
                break;
            default:
                this.throwValidationError(
                    key,
                    value,
                    "Unknown key provided for validation."
                );
        }

        this.logValidationSuccess(key, value);
    }

    /**
     * Validates the step name.
     * Ensures it is a non-empty string.
     * 
     * @param name - The step name to validate.
     * @throws Error if the name is invalid.
     */
    private validateName(name: string): void {
        if (!name || typeof name !== "string" || name.trim() === "") {
            this.throwValidationError(
                "name",
                name,
                "Each step must have a valid, non-empty 'name' property."
            );
        }
    }

    /**
     * Validates the action object of the step.
     * Uses `ActionValidator` to validate the action's `name`.
     * 
     * @param action - The action object to validate.
     * @throws Error if the action is invalid.
     */
    private validateActions(action: StepInterface["action"]): void {
        if (
            !action || typeof action.name !== "string" || action.name.trim() === ""
        ) {
            this.throwValidationError(
                "action",
                action,
                "Each step must have a valid 'action' object with a non-empty 'name' property."
            );
        }

        try {
            this.actionValidator.validate(action.name); // Validate the action name
        } catch (error) {
            this.throwValidationError(
                "action",
                action,
                (error as Error).message
            );
        }
    }

    



    /**
     * Validates the step options.
     * Ensures options conform to `StepOptionsInterface`.
     * 
     * @param options - The options object to validate.
     * @throws Error if the options are invalid.
     */
    private validateOptions(options: StepOptionsInterface | undefined): void {
        // Ensure options are not null
        if (options === null) {
            this.throwValidationError(
                "options",
                options,
                "Step options must be a valid object or undefined, but 'null' was provided."
            );
        }

        if (options && (typeof options !== "object" || Array.isArray(options))) {
            this.throwValidationError(
                "options",
                options,
                "Step options must be a valid object conforming to StepOptionsInterface."
            );
        }

        // Validate individual properties within `options`
        if (options) {
            for (const [key, value] of Object.entries(options)) {
                switch (key) {
                    case "description":
                        if (value !== undefined && typeof value !== "string") {
                            this.throwValidationError(
                                "options",
                                value,
                                `Invalid value for "description": must be a string.`
                            );
                        }
                        break;

                    case "enabled":
                        if (value !== undefined && typeof value !== "boolean") {
                            this.throwValidationError(
                                "options",
                                value,
                                `Invalid value for "enabled": must be a boolean.`
                            );
                        }
                        break;

                    default:
                        // For additional custom keys, you can implement further checks
                        this.logInfo(
                            `Validating additional key "${key}" with value "${value}".`
                        );
                        break;
                }
            }
        }

        this.logInfo("Step options validated successfully.");
    }


}