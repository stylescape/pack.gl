// src/Stage.ts

import { Stage as StageType } from './types';
import { Step } from './Step';

/**
 * Represents a stage in the pipeline, encapsulating its execution logic and dependencies.
 */
export class Stage {
    private name: string;
    private steps: Step[];
    private dependsOn?: string[];

    /**
     * Constructs a Stage instance with the given stage definition.
     * @param stage - The stage definition containing name, steps, and dependencies.
     */
    constructor(stage: StageType) {
        this.name = stage.name;
        this.steps = stage.steps.map(step => new Step(step));
        this.dependsOn = stage.dependsOn;
    }

    /**
     * Executes the stage by running its steps consecutively.
     * Handles dependencies before executing the stage.
     * @param completedStages - A set of completed stage names used for dependency tracking.
     */
    async execute(completedStages: Set<string>) {
        // Check and wait for dependencies
        if (this.dependsOn) {
            await Promise.all(this.dependsOn.map(dep => this.waitForStage(dep, completedStages)));
        }

        console.log(`Executing stage: ${this.name}`);

        // Execute all steps within the stage consecutively
        for (const step of this.steps) {
            await step.execute();
        }

        // Mark the stage as completed
        completedStages.add(this.name);
        console.log(`Stage ${this.name} completed.`);
    }

    /**
     * Waits for a stage to complete by checking the completed stages set.
     * @param stageName - The name of the stage to wait for.
     * @param completedStages - A set of completed stage names used for dependency tracking.
     */
    private async waitForStage(stageName: string, completedStages: Set<string>) {
        while (!completedStages.has(stageName)) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait briefly before checking again
        }
    }
}