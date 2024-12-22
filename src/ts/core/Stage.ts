// src/core/Stage.ts


// ============================================================================
// Import
// ============================================================================

import { StageInterface } from "../interface/StageInterface";
import { Step } from "./Step";


// ============================================================================
// Class
// ============================================================================

/**
 * Represents a stage in the pipeline, encapsulating its execution logic and
 * dependencies. Each stage consists of multiple steps that are executed
 * consecutively, and stages can have dependencies on other stages which are
 * managed before execution.
 */
export class Stage {


    // Parameters
    // ========================================================================

    private name: string;
    private steps: Step[];
    private dependsOn?: string[];


    // Constructor
    // ========================================================================

    /**
     * Constructs a Stage instance with the given stage definition.
     * @param stage - The stage definition containing name, steps, and
     * dependencies.
     */
    constructor(stage: StageInterface) {
        this.name = stage.name;
        this.steps = stage.steps.map(step => new Step(step));
        this.dependsOn = stage.dependsOn;
    }


    // Methods
    // ========================================================================

    /**
     * Executes the stage by running its steps consecutively.
     * Manages dependencies by waiting for dependent stages to complete 
     * before execution.
     * @param completedStages - A set of completed stage names used for
     * dependency tracking.
     * @throws Error if any step within the stage fails.
     */
    async execute(completedStages: Set<string>): Promise<void> {
        // Handle dependencies before executing the stage
        if (this.dependsOn) {
            await this.resolveDependencies(completedStages);
        }

        console.log(`Executing stage: ${this.name}`);

        // Execute all steps within the stage consecutively
        try {
            for (const step of this.steps) {
                await step.execute();
            }
            console.log(`Stage ${this.name} completed successfully.`);
            completedStages.add(this.name);
        } catch (error) {
            console.error(`Error executing stage ${this.name}:`, error);
            // Propagate the error to halt pipeline or manage based on
            // global settings
            throw error;
        }
    }

    /**
     * Resolves dependencies by ensuring all required stages have completed.
     * @param completedStages - A set of completed stage names used for
     * dependency tracking.
     * @returns A promise that resolves once all dependencies are met.
     */
    private async resolveDependencies(completedStages: Set<string>): Promise<void> {
        if (!this.dependsOn) return;

        console.log(
            `Stage ${this.name} is waiting for dependencies: ${this.dependsOn.join(", ")}`
        );
        await Promise.all(
            this.dependsOn.map(
                dep => this.waitForStageCompletion(
                    dep,
                    completedStages
                )
            )
        );
        console.log(`All dependencies resolved for stage: ${this.name}`);
    }

    /**
     * Waits for a specified stage to complete by monitoring the completed
     * stages set.
     * @param stageName - The name of the stage to wait for.
     * @param completedStages - A set of completed stage names used for
     * dependency tracking.
     * @returns A promise that resolves when the specified stage is marked
     * as completed.
     */
    private async waitForStageCompletion(
        stageName: string,
        completedStages: Set<string>
    ): Promise<void> {
        while (!completedStages.has(stageName)) {
            await new Promise(
                resolve => setTimeout(
                    resolve,
                    100 // Polling interval to check completion status
                )
            );
        }
    }

}
