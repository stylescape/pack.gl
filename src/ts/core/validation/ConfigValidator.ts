// ============================================================================
// Import
// ============================================================================

import type { ConfigInterface } from "../../interface/ConfigInterface.js";
import { AbstractValidator } from "../abstract/AbstractValidator.js";
import { StageValidator } from "./StageValidator.js";

// ============================================================================
// Class
// ============================================================================

/**
 * Validates the overall configuration, including stages and global options.
 */
export class ConfigValidator extends AbstractValidator<ConfigInterface> {
    // Parameters
    // ========================================================================

    private stageValidator: StageValidator;

    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.stageValidator = new StageValidator();
        this.logInfo("ConfigValidator initialized.");
    }

    // Methods
    // ========================================================================

    /**
     * Validates the entire configuration object.
     * @param config - The configuration object to validate.
     * @throws Error if validation fails.
     */
    public validate(config: ConfigInterface): void {
        this.logInfo("Validating configuration.");

        // Validate each property of the configuration
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                this.validateProperty(
                    key as keyof ConfigInterface,
                    config[key as keyof ConfigInterface],
                );
            }
        }

        this.logInfo("Configuration validated successfully.");
    }

    /**
     * Validates a specific property of the configuration object.
     *
     * @param key - The key of the property to validate.
     * @param value - The value of the property to validate.
     * @throws Error if validation fails.
     */
    protected validateProperty<K extends keyof ConfigInterface>(
        key: K,
        value: ConfigInterface[K],
    ): void {
        switch (key) {
            case "extends":
                // Already resolved by ConfigLoader, skip validation
                break;

            case "stages":
                if (Array.isArray(value)) {
                    this.validateStages(value as ConfigInterface["stages"]); // Validate only if it's an array
                } else {
                    this.throwValidationError(
                        key,
                        value,
                        "'stages' must be an array.",
                    );
                }
                break;

            case "metadata":
            case "options":
            case "validateConfig":
                // Optional properties - no strict validation required
                break;

            default:
                // Add validation for other properties if needed
                this.throwValidationError(
                    key,
                    value,
                    `Unknown or unsupported configuration property: "${String(key)}".`,
                );
        }

        this.logValidationSuccess(key, value);
    }

    /**
     * Validates the stages in the configuration.
     *
     * @param stages - The stages to validate.
     * @throws Error if validation fails.
     */
    private validateStages(stages: ConfigInterface["stages"]): void {
        for (const stage of stages) {
            // Validate each stage
            this.stageValidator.validate(stage);
        }
    }
}
