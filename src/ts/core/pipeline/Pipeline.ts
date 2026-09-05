// ============================================================================
// Import
// ============================================================================

import type { ConfigInterface } from "../../interface/ConfigInterface.js";
import type { StageInterface } from "../../interface/StageInterface.js";
import { BuildError, StageError } from "../../errors/index.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { FileCache } from "../cache/FileCache.js";
import { BuildCache } from "../cache/BuildCache.js";
import { StepCache } from "../cache/StepCache.js";
import { resolvePipelineOptions } from "../config/resolveOptions.js";
import type { ResolvedPipelineOptions } from "../config/resolveOptions.js";
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

    /**
     * Step-level content-hash cache, present only when caching is enabled.
     */
    private stepCache?: StepCache;

    /**
     * Execution settings after reconciling the configuration's option blocks.
     */
    private resolved: ResolvedPipelineOptions;

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
        this.validateStageDependencies(config.stages);
        this.options = config.options;
        this.resolved = resolvePipelineOptions(config.options);

        // The cache instance is created up front so every step shares it, but
        // it only reads from disk once `initialize` runs in `run()`.
        if (config.options?.cache?.enabled) {
            this.stepCache = StepCache.getInstance({
                cacheDir: config.options.cache.cacheDir,
                ttl: config.options.cache.ttl,
            });
        }

        this.stages = config.stages.map(
            (stage) =>
                new Stage(stage, {
                    defaultTimeout: this.resolved.stepTimeout,
                    retries: this.resolved.retries,
                    retryDelay: this.resolved.retryDelay,
                    maxConcurrentSteps: this.resolved.maxConcurrentSteps,
                    cache: this.stepCache ?? null,
                }),
        );
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

            // Execute all stages with dependency-aware concurrency control
            await this.runWithConcurrencyControl(completedStages);

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
            this.reportCacheStats();

            // A failed run is reported to the caller, which decides how to
            // surface it: the CLI turns it into a non-zero exit status, while
            // live mode logs it and keeps serving. Swallowing it here made a
            // broken build indistinguishable from a successful one, so
            // `haltOnFailure: false` produced a green exit code for a build
            // that had failed.
            throw error;
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

        await this.stepCache?.initialize();
        // Counters describe this run, not the process's whole history.
        this.stepCache?.resetStats();

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
        await Promise.all([
            this.fileCache?.save(),
            this.buildCache?.save(),
            this.stepCache?.save(),
        ]);
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
        if (this.stepCache) {
            const stats = this.stepCache.getStats();
            const considered = stats.hits + stats.misses;
            if (considered > 0) {
                // Worth an info-level line: it is the difference between a
                // build that did work and one that decided it did not need to.
                this.logInfo(
                    stats.hits === considered
                        ? `All ${considered} cacheable step(s) were up to date.`
                        : `Step cache: ${stats.hits}/${considered} step(s) up to date (${stats.hitRate}).`,
                );
            }
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
     * Validates that every `dependsOn` entry references an existing stage
     * and that the dependency graph contains no cycles. Either defect would
     * otherwise make the pipeline wait forever with no diagnostic.
     *
     * @param stages - The stage definitions from the configuration.
     * @throws StageError if a dependency is unknown or circular.
     */
    private validateStageDependencies(stages: StageInterface[]): void {
        const stagesByName = new Map<string, StageInterface>();
        for (const stage of stages) {
            stagesByName.set(stage.name, stage);
        }

        for (const stage of stages) {
            for (const dependency of stage.dependsOn ?? []) {
                if (!stagesByName.has(dependency)) {
                    throw new StageError(
                        stage.name,
                        `depends on unknown stage "${dependency}". ` +
                            `Ensure 'dependsOn' references existing stage names.`,
                    );
                }
            }
        }

        const visited = new Set<string>();
        const visiting = new Set<string>();
        const visit = (name: string): void => {
            if (visited.has(name)) return;
            if (visiting.has(name)) {
                throw new StageError(
                    name,
                    "circular 'dependsOn' dependency detected.",
                );
            }
            visiting.add(name);
            for (const dependency of stagesByName.get(name)?.dependsOn ?? []) {
                visit(dependency);
            }
            visiting.delete(name);
            visited.add(name);
        };
        for (const stage of stages) {
            visit(stage.name);
        }
    }

    /**
     * Finds the index of the next stage to start: among those whose
     * dependencies are all satisfied, the one with the highest `priority`.
     * Ties keep configuration order, so a pipeline that sets no priorities
     * behaves exactly as before.
     *
     * @param pending - Stages not yet started, with their definitions.
     * @param completedStages - Names of stages that have finished.
     * @returns The index into `pending`, or -1 when nothing is ready.
     */
    private findNextReady(
        pending: { stage: Stage; definition: StageInterface }[],
        completedStages: Set<string>,
    ): number {
        const weight = { high: 0, normal: 1, low: 2 } as const;

        let best = -1;
        for (let index = 0; index < pending.length; index++) {
            const { definition } = pending[index];
            const ready = (definition.dependsOn ?? []).every((dependency) =>
                completedStages.has(dependency),
            );
            if (!ready) continue;

            if (
                best === -1 ||
                weight[pending[index].stage.getPriority()] <
                    weight[pending[best].stage.getPriority()]
            ) {
                best = index;
            }
        }

        return best;
    }

    /**
     * Runs the stages with dependency-aware concurrency control. A stage is
     * only started once all of its `dependsOn` stages have completed, and no
     * more than `maxConcurrentStages` stages run at any moment.
     *
     * @param completedStages - Shared set tracking completed stage names.
     */
    private async runWithConcurrencyControl(
        completedStages: Set<string>,
    ): Promise<void> {
        // `0` means "no limit"; fall back to the stage count so the loop below
        // can always start at least one stage.
        const maxConcurrentStages =
            this.resolved.maxConcurrentStages || this.stages.length || 1;

        // Pair each Stage with its definition so the scheduler can read
        // `dependsOn` (Stage keeps it private).
        const pending = this.stages.map((stage, index) => ({
            stage,
            definition: this.config.stages[index],
        }));
        const executing = new Set<Promise<void>>();

        // Only used when `haltOnFailure` is false, where a stage failure is
        // recorded and the run continues with the stages that do not depend
        // on it. The collected failures are reported at the end.
        const failures: { stage: string; error: unknown }[] = [];

        try {
            while (pending.length > 0 || executing.size > 0) {
                // Start every stage whose dependencies are met, up to the
                // concurrency limit. Among the ready stages the
                // highest-priority one goes first, which only matters when the
                // limit forces a choice.
                let readyIndex: number;
                while (
                    executing.size < maxConcurrentStages &&
                    (readyIndex = this.findNextReady(
                        pending,
                        completedStages,
                    )) !== -1
                ) {
                    const [{ stage }] = pending.splice(readyIndex, 1);
                    const run = stage.execute(completedStages).then(() => {
                        this.progress?.increment();
                    });

                    // With `haltOnFailure` off, a stage failure is absorbed
                    // here so the scheduler keeps going; the run still fails
                    // at the end, from the collected list.
                    const execution = this.resolved.haltOnFailure
                        ? run
                        : run.catch((error: unknown) => {
                              failures.push({
                                  stage: stage.getName(),
                                  error,
                              });
                              this.logWarn(
                                  `Stage "${stage.getName()}" failed; continuing with the stages that do not depend on it.`,
                              );
                          });

                    executing.add(execution);
                    // Remove the promise from the tracking set on settle;
                    // the rejection itself surfaces via the race below.
                    void execution
                        .finally(() => executing.delete(execution))
                        .catch(() => undefined);
                }

                if (executing.size === 0) {
                    if (failures.length > 0) {
                        // Everything still pending sits behind a stage that
                        // failed, so none of it can ever become ready.
                        for (const { definition } of pending) {
                            this.logWarn(
                                `Stage "${definition.name}" skipped: it depends on a stage that failed.`,
                            );
                        }
                        pending.length = 0;
                        break;
                    }

                    // Unreachable after dependency validation, but guard
                    // against a scheduler stall instead of spinning forever.
                    throw new StageError(
                        pending[0].definition.name,
                        "cannot be scheduled: unresolved dependencies.",
                    );
                }

                // Wait until at least one running stage settles
                await Promise.race(executing);
            }
        } catch (error) {
            // Let in-flight stages settle so their rejections are observed
            // before propagating the failure.
            await Promise.allSettled(executing);
            throw error;
        }

        if (failures.length > 0) {
            throw new BuildError(
                `${failures.length} stage(s) failed: ` +
                    failures.map(({ stage }) => `"${stage}"`).join(", "),
                { stages: failures.map(({ stage }) => stage) },
                failures[0].error instanceof Error
                    ? failures[0].error
                    : undefined,
            );
        }
    }
}
