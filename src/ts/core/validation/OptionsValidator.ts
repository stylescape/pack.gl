// ============================================================================
// Import
// ============================================================================

import { AbstractValidator } from "../abstract/AbstractValidator";
import { OptionsInterface } from "../../interface/OptionsInterface";


// ============================================================================
// Class
// ============================================================================

/**
 * OptionsValidator provides centralized validation logic for pipeline options.
 * Extends AbstractValidator for consistent validation and logging.
 */
export class OptionsValidator extends AbstractValidator<OptionsInterface> {

    // Parameters
    // ========================================================================

    // A runtime mapping of enumerated options for validation
    private static allowedValues: Partial<Record<keyof OptionsInterface, unknown[]>> = {
        logLevel: ["verbose", "info", "warn", "error"],
        defaultPriority: ["low", "normal", "high"],
    };


    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.logInfo("OptionsValidator initialized.");
    }

    // Methods
    // ========================================================================

    /**
     * Validates a specific property of the options object.
     *
     * @param key - The key of the option to validate.
     * @param value - The value of the option to validate.
     * @throws Error if validation fails.
     */
    protected validateProperty<K extends keyof OptionsInterface>(key: K, value: OptionsInterface[K]): void {
        if (value === undefined) {
            this.throwValidationError(key, value, `Option "${String(key)}" cannot be undefined.`);
            return;
        }

        const allowedValues = OptionsValidator.allowedValues[key];

        if (allowedValues) {
            if (!allowedValues.includes(value)) {
                this.throwValidationError(
                    key,
                    value,
                    `Invalid value "${value}" for option "${String(key)}". Allowed values are: ${allowedValues.join(", ")}.`
                );
            }
        } else {
            this.validateByType(key, value);
        }

        this.logValidationSuccess(key, value);
    }

    /**
     * Validates a property based on its type when it does not have predefined allowed values.
     * 
     * @param key - The key to validate.
     * @param value - The value to validate.
     */
    private validateByType<K extends keyof OptionsInterface>(key: K, value: OptionsInterface[K]): void {
        switch (key) {
            case "stepTimeout":
            case "maxConcurrentStages":
                if (typeof value === "number") {
                    this.validateNumber(key, value);
                } else {
                    this.throwValidationError(key, value, "Must be a non-negative number.");
                }
                break;
            case "haltOnFailure":
            case "dryRun":
            case "enableTimingLogs":
                if (typeof value === "boolean") {
                    this.validateBoolean(key, value);
                } else {
                    this.throwValidationError(key, value, "Must be a boolean.");
                }
                break;
            case "tags":
                if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    this.validateObject(key, value);
                } else {
                    this.throwValidationError(key, value, "Must be a valid object.");
                }
                break;
            default:
                if (typeof value === "string") {
                    this.validateString(key, value);
                } else {
                    this.throwValidationError(key, value, "Must be a non-empty string.");
                }
        }
    }
}


// if (options.liveReload?.port && (options.liveReload.port < 1 || options.liveReload.port > 65535)) {
//     throw new Error("Invalid port number in liveReload configuration.");
// }