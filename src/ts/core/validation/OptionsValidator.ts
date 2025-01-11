// ============================================================================
// Import
// ============================================================================

import { OptionsInterface } from "../../interface/OptionsInterface";
import { AbstractValidator } from "../abstract/AbstractValidator";


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

    /**
     * A runtime mapping of enumerated options for validation.
     */
    private static allowedValues: Partial<Record<keyof OptionsInterface, unknown[]>> = {
        logLevel: [
            "debug",
            "info",
            "warn",
            "error",
           ],
    };


    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.logDebug("OptionsValidator initialized.");
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
    protected validateProperty<K extends keyof OptionsInterface>(
        key: K,
        value: OptionsInterface[K]
    ): void {
        if (value === undefined) {
            this.throwValidationError(
                key,
                value,
                `Option "${String(key)}" cannot be undefined.`
            );
            return;
        }

        const allowedValues = OptionsValidator.allowedValues[key];
        if (allowedValues && !allowedValues.includes(value)) {
            this.throwValidationError(
                key,
                value,
                `Invalid value "${value}" for option "${String(key)}". Allowed values are: ${allowedValues.join(", ")}.`
            );
            return;
        }

        this.validateByType(key, value);
        this.logValidationSuccess(key, value);
    }

    /**
     * Validates a property based on its type when it does not have predefined
     * allowed values.
     *
     * @param key - The key to validate.
     * @param value - The value to validate.
     */
    private validateByType<K extends keyof OptionsInterface>(
        key: K,
        value: OptionsInterface[K]
    ): void {
        switch (key) {
            case "stepTimeout":
            case "maxConcurrentStages":
                if (typeof value === "number" && value >= 0) {
                    this.validateNumber(key, value);
                } else {
                    this.throwValidationError(
                        key,
                        value,
                        "Must be a non-negative number."
                    );
                }
                break;

            case "haltOnFailure":
            case "tags":
                if (this.isValidObject(value)) {
                    this.validateObject(key, value);
                } else {
                    this.throwValidationError(key, value, "Must be a valid object.");
                }
                break;

            case "live":
                this.validateLiveOptions(value as OptionsInterface["live"]);
                break;

            default:
                if (typeof value === "string" && value.trim() !== "") {
                    this.validateString(key, value);
                } else {
                    this.throwValidationError(key, value, "Must be a non-empty string.");
                }
        }
    }

    /**
     * Validates the `live` configuration, ensuring all nested properties
     * conform to their expected types and ranges.
     *
     * @param value - The live reload configuration to validate.
     */
    private validateLiveOptions(value: OptionsInterface["live"]): void {
        if (value?.port && (value.port < 1 || value.port > 65535)) {
            this.throwValidationError(
                "live.port",
                value.port,
                "Port must be a number between 1 and 65535."
            );
        }
        if (value?.root && typeof value.root !== "string") {
            this.throwValidationError("live.root", value.root, "Root must be a valid string path.");
        }
        if (value?.watchPaths && !Array.isArray(value.watchPaths)) {
            this.throwValidationError("live.watchPaths", value.watchPaths, "Must be an array of paths.");
        }
        if (value?.ignoredPaths && !Array.isArray(value.ignoredPaths)) {
            this.throwValidationError("live.ignoredPaths", value.ignoredPaths, "Must be an array of paths.");
        }
    }

    /**
     * Checks if the given value is a valid object.
     *
     * @param value - The value to check.
     * @returns True if the value is an object and not null or an array.
     */
    private isValidObject(value: unknown): value is Record<string, unknown> {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }
}
