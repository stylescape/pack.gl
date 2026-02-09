// ============================================================================
// Import
// ============================================================================

import type { ConfigInterface } from "../../interface/ConfigInterface.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { FileCache } from "../cache/FileCache.js";
import { BuildCache } from "../cache/BuildCache.js";
import { ProgressReporter } from "../progress/ProgressReporter.js";
import { Stage } from "./Stage.js";

// ============================================================================
// Class
// ============================================================================

/**
 * Represents the pipeline of stages to be executed.
 * This class manages the execution flow of stages, including parallel
 * execution, dependency handling, caching, progress reporting, and applying
 * global options for consistent pipeline behavior.
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

    /**
     * File cache for tracking file changes.
     */
    private fileCache?: FileCache;

    /**
     * Build cache for caching build outputs.
     */
    private buildCache?: BuildCache;

    /**
     * Progress reporter for showing build progress.
     */
    private progress?: ProgressReporter;

    // Constructor
    // ========================================================================

    /**
     * Constructs a new Pipeline instance with the given configuration.
     * Initializes stages and applies global options for execution control.
     *
     * @param config - The configuration object defining the stages, steps,
     * and global options for the pipeline.
     */
    constructor(private config: ConfigInterface) {
        super();
        this.stages = config.stages.map((stage) => new Stage(stage));
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
        const startTime = performance.now();
        this.logInfo("Starting pipeline execution...");

        // Initialize caching if enabled
        await this.initializeCaching();

        // Initialize progress reporter if enabled
        this.initializeProgress();

        // Track stages that have been completed
        const completedStages = new Set<string>();

        // Run stages with dependency management and parallel execution control
        try {
            this.logDebug("Pipeline execution started with debug logging.");
            this.progress?.start();

            // Execute all stages with concurrency control
            const stagePromises = this.stages.map((stage, index) =>
                stage.execute(completedStages).then(() => {
                    this.progress?.increment();
                }),
            );
            await this.runWithConcurrencyControl(stagePromises);

            this.progress?.finish();

            // Save caches
            await this.saveCaches();

            const duration = performance.now() - startTime;
            this.logInfo(
                `Pipeline execution completed successfully in ${this.formatDuration(duration)}.`,
            );
            this.reportCacheStats();
        } catch (error) {
            this.progress?.cancel();
            this.logError("Pipeline execution failed:", error);

            // Save caches even on failure
            await this.saveCaches();

            // Halt pipeline if configured to do so on failure
            if (this.options?.haltOnFailure !== false) {
                this.logError("Halting pipeline due to failure.");
                process.exit(1);
            } else {
                this.logWarn("Continuing pipeline execution despite errors.");
            }
        }
    }

    /**
     * Initializes caching systems if enabled in options.
     */
    private async initializeCaching(): Promise<void> {
        const cacheOptions = this.options?.cache;
        if (!cacheOptions?.enabled) {
            return;
        }

        this.logInfo("Initializing build cache...");

        this.fileCache = FileCache.getInstance({
            cacheDir: cacheOptions.cacheDir,
            ttl: cacheOptions.ttl,
        });
        await this.fileCache.initialize();

        this.buildCache = BuildCache.getInstance({
            cacheDir: cacheOptions.cacheDir,
            maxCacheSize: cacheOptions.maxCacheSize,
            ttl: cacheOptions.ttl,
        });
        await this.buildCache.initialize();

        this.logDebug("Build cache initialized.");
    }

    /**
     * Initializes the progress reporter if enabled.
     */
    private initializeProgress(): void {
        const perfOptions = this.options?.performance;
        if (perfOptions?.showProgress === false) {
            return;
        }

        this.progress = new ProgressReporter({
            total: this.stages.length,
            label: "Pipeline",
            showPercentage: true,
            showEta: true,
        });
    }

    /**
     * Saves caches to disk.
     */
    private async saveCaches(): Promise<void> {
        await Promise.all([this.fileCache?.save(), this.buildCache?.save()]);
    }

    /**
     * Reports cache statistics.
     */
    private reportCacheStats(): void {
        if (this.fileCache) {
            const stats = this.fileCache.getStats();
            this.logDebug(
                `File cache: ${stats.size} entries, ${stats.hitRate} hit rate`,
            );
        }
        if (this.buildCache) {
            const stats = this.buildCache.getStats();
            this.logDebug(
                `Build cache: ${stats.size} entries, ${stats.hitRate} hit rate`,
            );
        }
    }

    /**
     * Formats a duration in milliseconds to a human-readable string.
     */
    private formatDuration(ms: number): string {
        if (ms < 1000) {
            return `${Math.round(ms)}ms`;
        }
        if (ms < 60000) {
            return `${(ms / 1000).toFixed(2)}s`;
        }
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(1);
        return `${minutes}m ${seconds}s`;
    }

    /**
     * Runs the stage promises with concurrency control based on global
     * options. Limits the number of parallel running stages if
     * maxConcurrentStages is set in global options.
     * @param stagePromises - An array of promises representing stage
     * executions.
     */
    private async runWithConcurrencyControl(
        stagePromises: Promise<void>[],
    ): Promise<void> {
        // Support both old and new option locations
        const maxConcurrentStages =
            this.options?.performance?.maxConcurrentStages ||
            this.options?.maxConcurrentStages ||
            stagePromises.length;

        // Process stages with a concurrency limit
        const executingStages = new Set<Promise<void>>();

        for (const stagePromise of stagePromises) {
            executingStages.add(stagePromise);

            // Ensure stages are removed from the set once complete
            stagePromise.finally(() => executingStages.delete(stagePromise));

            // Enforce concurrency limit
            if (executingStages.size >= (maxConcurrentStages as number)) {
                // Wait until at least one stage completes
                await Promise.race(executingStages);
            }
        }

        // Wait for all remaining stages to complete
        await Promise.all(executingStages);
    }
}
