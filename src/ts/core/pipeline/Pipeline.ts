// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../abstract/AbstractProcess";
import { ConfigInterface } from "../../interface/ConfigInterface";
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
export class Pipeline extends AbstractProcess {


    // Parameters
    // ========================================================================

    /**
     * List of stages to be executed in the pipeline.
     */
    private stages: Stage[];

    /**
     * Global options that apply across the entire pipeline.
     */
    private options?: ConfigInterface["options"];


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
        super();
        this.stages = config.stages.map(
            stage => new Stage(stage)
        );
        this.options = config.options;
        this.logInfo("Pipeline instance created.");
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
        
        this.logInfo("Starting pipeline execution...");

        // Track stages that have been completed
        const completedStages = new Set<string>();

        // Run stages with dependency management and parallel execution control
        try {

            this.logDebug("Pipeline execution debug message.");

            const stagePromises = this.stages.map(
                stage => stage.execute(completedStages)
            );
            await this.runWithConcurrencyControl(stagePromises);

            this.logInfo("Pipeline execution completed successfully.");

        } catch (error) {

            this.logError("Pipeline execution failed:", error);

            if (this.options?.haltOnFailure !== false) {
                this.logError("Halting pipeline due to failure.");
                // Optionally halt the process if the pipeline is set to
                // halt on failure
                process.exit(1);
            }
        }

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
        const maxConcurrentStages = this.options?.maxConcurrentStages || stagePromises.length;

        // Process stages with a concurrency limit
        const executingStages = new Set<Promise<void>>();

        for (const stagePromise of stagePromises) {
            executingStages.add(stagePromise);

            // Ensure stages are removed from the set once complete
            stagePromise.finally(() => executingStages.delete(stagePromise));

            // Enforce concurrency limit
            if (executingStages.size >= maxConcurrentStages) {
                // Wait until at least one stage completes
                await Promise.race(executingStages);
            }
        }

        // Wait for all remaining stages to complete
        await Promise.all(executingStages);
    }

    /**
     * Validates the pipeline configuration before execution.
     * Ensures all stages and dependencies are properly defined.
     * @throws Error if the configuration is invalid.
     */
    // private validateConfig(): void {
    //     this.logInfo("Validating pipeline configuration...");

    //     if (!this.stages.length) {
    //         throw new Error("Pipeline configuration must include at least one stage.");
    //     }

    //     const stageNames = new Set<string>();
    //     for (const stage of this.stages) {
    //         if (stageNames.has(stage.name)) {
    //             throw new Error(`Duplicate stage name detected: ${stage.name}`);
    //         }
    //         stageNames.add(stage.name);
    //     }

    //     this.logInfo("Pipeline configuration validated successfully.");
    // }


}
