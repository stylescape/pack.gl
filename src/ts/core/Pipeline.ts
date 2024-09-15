// src/pipeline.ts

import { Config, Stage as StageType } from './types';
import { Stage } from './Stage';

/**
 * Represents the pipeline of stages to be executed.
 * This class manages the execution flow of stages, including parallel execution and dependency handling.
 */
export class Pipeline {
    /**
     * Map of stages by their names for easy lookup.
     */
    private stages: Stage[];

    /**
     * Constructs a new Pipeline instance with the given configuration.
     * @param config - The configuration object defining the stages, steps, and global options for the pipeline.
     */
    constructor(private config: Config) {
        this.stages = config.stages.map(stage => new Stage(stage));
    }

    /**
     * Runs the pipeline, executing stages based on their dependencies.
     * Stages are run in parallel by default, but their execution respects defined dependencies.
     */
    async run() {
        console.log('Starting pipeline execution...');

        // Track stages that have been completed
        const completedStages = new Set<string>();

        // Run stages with dependency management
        const stagePromises = this.stages.map(stage => stage.execute(completedStages));

        // Wait for all stages to complete
        await Promise.all(stagePromises);

        console.log('Pipeline execution completed.');
    }
}