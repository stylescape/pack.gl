// ============================================================================
// Import
// ============================================================================

import { ConfigInterface } from "../interface/ConfigInterface";
import { Stage } from "./Stage";


// ============================================================================
// Class
// ============================================================================

/**
 * Represents the pipeline of stages to be executed.
 * This class manages the execution flow of stages, including parallel
 * execution, dependency handling, and applying global options for consistent
 * pipeline behavior.
 */
export class Pipeline {


    // Parameters
    // ========================================================================

    /**
     * List of stages to be executed in the pipeline.
     */
    private stages: Stage[];

    /**
     * Global options that apply across the entire pipeline.
     */
    private globalOptions?: ConfigInterface["globalOptions"];


    // Constructor
    // ========================================================================

    /**
     * Constructs a new Pipeline instance with the given configuration.
     * Initializes stages and applies global options for execution control.
     * @param config - The configuration object defining the stages, steps,
     * and global options for the pipeline.
     */
    constructor(
        private config: ConfigInterface
    ) {
        this.stages = config.stages.map(stage => new Stage(stage));
        this.globalOptions = config.globalOptions;
    }


    // Methods
    // ========================================================================

    /**
     * Runs the pipeline, executing stages based on their dependencies.
     * Stages are run in parallel by default, but their execution respects
     * defined dependencies. Applies global options for logging, error
     * handling, and execution control.
     */
    async run(): Promise<void> {
        console.log("Starting pipeline execution...");

        // Track stages that have been completed
        const completedStages = new Set<string>();

        // Run stages with dependency management and parallel execution control
        try {
            const stagePromises = this.stages.map(
                stage => stage.execute(completedStages)
            );
            await this.runWithConcurrencyControl(stagePromises);
        } catch (error) {
            console.error("Pipeline execution failed:", error);
            if (this.globalOptions?.haltOnFailure !== false) {
                console.error("Halting pipeline due to failure.");
                // Optionally halt the process if the pipeline is set to
                // halt on failure
                process.exit(1);
            }
        }

        console.log("Pipeline execution completed successfully.");
    }

    /**
     * Runs the stage promises with concurrency control based on global
     * options. Limits the number of parallel running stages if
     * maxConcurrentStages is set in global options.
     * @param stagePromises - An array of promises representing stage
     * executions.
     */
    private async runWithConcurrencyControl(
        stagePromises: Promise<void>[]
    ): Promise<void> {
        const maxConcurrentStages = this.globalOptions?.maxConcurrentStages || stagePromises.length;

        // Process stages with a concurrency limit
        const executingStages = new Set<Promise<void>>();

        for (const stagePromise of stagePromises) {
            executingStages.add(stagePromise);

            stagePromise.finally(() => executingStages.delete(stagePromise));

            if (executingStages.size >= maxConcurrentStages) {
                // Wait until at least one stage completes
                await Promise.race(executingStages);
            }
        }

        // Wait for all remaining stages to complete
        await Promise.all(executingStages);
    }

}
