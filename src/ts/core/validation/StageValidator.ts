// ============================================================================
// Import
// ============================================================================

import { StageInterface } from "../../interface/StageInterface";
import { AbstractValidator } from "../abstract/AbstractValidator";
import { StepValidator } from "./StepValidator";


// ============================================================================
// Class
// ============================================================================

/**
 * StageValidator ensures that stages within the configuration meet the required criteria.
 * It validates the stage properties, dependencies, and steps for correctness.
 */
export class StageValidator extends AbstractValidator<StageInterface> {


    // Parameters
    // ========================================================================

    private stageNames: Set<string>;
    private stepValidator: StepValidator;


    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.stageNames = new Set();
        this.stepValidator = new StepValidator();
        this.logInfo("StageValidator initialized.");
    }

    // Methods
    // ========================================================================

    /**
     * Validates an entire stage object.
     *
     * @param stage - The stage object to validate.
     * @throws Error if the stage or any of its properties are invalid.
     */
    public validate(stage: StageInterface): void {
        this.logInfo(`Validating stage: "${stage.name}"`);

        try {
            // Validate individual properties of the stage
            this.validateProperty("name", stage.name);
            this.validateProperty("dependsOn", stage.dependsOn);
            this.validateProperty("steps", stage.steps);

            this.logInfo(`Stage "${stage.name}" validated successfully.`);
        } catch (error) {
            this.logError(`Validation failed for stage "${stage.name}": ${(error as Error).message}`);
            throw error;
        }
    }

    /**
     * Validates individual properties of the stage.
     *
     * @param key - The property name to validate.
     * @param value - The property value to validate.
     * @throws Error if the property value is invalid.
     */
    public validateProperty<K extends keyof StageInterface>(
        key: K,
        value: StageInterface[K]
    ): void {
        switch (key) {
            case "name":
                this.validateName(value as string);
                break;

            case "dependsOn":
                this.validateDependencies(value as string[]);
                break;

            case "steps":
                this.validateSteps(value as StageInterface["steps"]);
                break;

            default:
                this.throwValidationError(key, value, "Unknown property provided for validation.");
        }

        // Log validation success with the property name and value
        this.logValidationSuccess(key, value);
    }

    /**
     * Validates the name of the stage.
     *
     * @param name - The name of the stage.
     * @throws Error if the name is invalid.
     */
    private validateName(name: string): void {
        if (!name || typeof name !== "string") {
            this.throwValidationError("name", name, "Stage must have a valid 'name' property.");
        }

        if (this.stageNames.has(name)) {
            this.throwValidationError("name", name, `Duplicate stage name found: "${name}".`);
        }

        this.stageNames.add(name);
    }

    /**
     * Validates the stage dependencies.
     *
     * @param dependencies - The dependencies to validate.
     * @throws Error if any dependency is invalid.
     */
    private validateDependencies(dependencies: string[] | undefined): void {
        if (dependencies && !Array.isArray(dependencies)) {
            throw new Error("Stage dependencies must be an array.");
        }

        dependencies?.forEach((dependency) => {
            if (!this.stageNames.has(dependency)) {
                this.throwValidationError(
                    "dependsOn",
                    [dependency], // Wrap dependency in an array to match the expected type
                    `Undefined dependency: "${dependency}". Ensure it references a valid stage.`
                );
            }
        });
    }


    /**
     * Validates the steps within the stage.
     *
     * @param steps - The steps array to validate.
     * @throws Error if any step is invalid.
     */
    private validateSteps(steps: StageInterface["steps"]): void {
        if (!Array.isArray(steps) || steps.length === 0) {
            this.throwValidationError(
                "steps",
                steps,
                "Each stage must contain at least one step."
            );
        }

        const stepNames = new Set<string>();
        steps.forEach((step) => {
            if (stepNames.has(step.name)) {
                this.throwValidationError(
                    "steps",
                    steps, // Pass the full steps array for context
                    `Duplicate step name found in stage: "${step.name}".`
                );
            }
            stepNames.add(step.name);

            // Validate each step using StepValidator
            this.stepValidator.validate(step);
        });
    }

}
