// ============================================================================
// Import
// ============================================================================

import type { StageInterface } from "../../interface/StageInterface.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { Step } from "./Step.js";
import type { StepRuntimeOptions } from "./Step.js";

// ============================================================================
// Class
// ============================================================================

/**
 * Represents a stage in the pipeline, encapsulating its execution logic and
 * dependencies. Each stage consists of multiple steps that can be executed
 * either consecutively (default) or in parallel for improved performance.
 * Stages can have dependencies on other stages which are managed before
 * execution.
 */
export class Stage extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Unique name of the stage, used in logs, dependency references, and
     * progress reporting.
     */
    private name: string;

    /**
     * The stage's steps, in configuration order. Executed sequentially unless
     * `parallel` is set.
     */
    private steps: Step[];

    /**
     * Names of stages that must finish before this one starts. Resolved by
     * the owning {@link Pipeline}, not by the stage itself.
     */
    private dependsOn?: string[];

    /**
     * Whether the steps run concurrently rather than one after another.
     * Defaults to false.
     */
    private parallel: boolean;

    /**
     * Upper bound on concurrently running steps when `parallel` is set.
     * Undefined means all steps start at once.
     */
    private maxConcurrentSteps?: number;

    /**
     * Whether this stage participates in step caching. False opts the stage
     * out even when the pipeline enables caching globally.
     */
    private cacheEnabled: boolean;

    /**
     * Whether the stage runs at all. A disabled stage is skipped but still
     * counts as satisfied for stages that depend on it.
     */
    private enabled: boolean;

    /**
     * Wall-clock budget for the whole stage, in milliseconds. Exceeding it
     * aborts the stage.
     */
    private timeout?: number;

    /**
     * Scheduling hint used to order stages that are eligible to run at the
     * same time. Defaults to `"normal"`.
     */
    private priority: "low" | "normal" | "high";

    /**
     * Free-form summary of what the stage does, surfaced in plan output.
     */
    private description?: string;

    /**
     * Arbitrary key/value labels carried with the stage for filtering and
     * reporting.
     */
    private tags?: Record<string, string>;

    /**
     * Optional `before`/`after` callbacks invoked around the stage's steps.
     */
    private hooks?: StageInterface["hooks"];

    // Constructor
    // ========================================================================

    /**
     * Constructs a Stage instance with the given stage definition.
     * @param stage - The stage definition containing name, steps, and
     * dependencies.
     * @param runtime - Pipeline-wide execution settings passed to each step.
     */
    constructor(stage: StageInterface, runtime: StepRuntimeOptions = {}) {
        super(); // Initialize logging
        this.name = stage.name;
        // `cacheEnabled: false` opts a stage out of caching even when the
        // pipeline has it on; leaving it unset inherits the global setting.
        const stepRuntime: StepRuntimeOptions =
            stage.cacheEnabled === false
                ? { ...runtime, cache: null }
                : runtime;
        this.steps = stage.steps.map((step) => new Step(step, stepRuntime));
        this.dependsOn = stage.dependsOn;
        this.parallel = stage.parallel ?? false;
        this.maxConcurrentSteps =
            stage.maxConcurrentSteps ?? runtime.maxConcurrentSteps;
        this.cacheEnabled = stage.cacheEnabled ?? true;
        this.enabled = stage.enabled ?? true;
        this.timeout = stage.timeout;
        this.priority = stage.priority ?? "normal";
        this.description = stage.description;
        this.tags = stage.tags;
        this.hooks = stage.hooks;

        this.logInfo(
            `Stage "${this.name}" initialized with ${this.steps.length} steps${this.parallel ? " (parallel)" : ""}.`,
        );
        if (this.description) {
            this.logDebug(`  ${this.description}`);
        }
        if (this.tags && Object.keys(this.tags).length > 0) {
            this.logDebug(
                `  tags: ${Object.entries(this.tags)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(", ")}`,
            );
        }
    }

    // Accessors
    // ========================================================================

    /**
     * The stage's name.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * The stage's scheduling priority. Used by the pipeline to break ties when
     * more stages are ready to run than the concurrency limit allows.
     */
    public getPriority(): "low" | "normal" | "high" {
        return this.priority;
    }

    /**
     * Whether this stage's steps will be executed.
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * The steps belonging to this stage.
     */
    public getSteps(): Step[] {
        return this.steps;
    }

    /**
     * Whether the stage is configured to skip work whose inputs are unchanged.
     */
    public isCacheEnabled(): boolean {
        return this.cacheEnabled;
    }

    // Methods
    // ========================================================================

    /**
     * Executes the stage by running its steps consecutively or in parallel.
     * Manages dependencies by waiting for dependent stages to complete
     * before execution.
     * @param completedStages - A set of completed stage names used for
     * dependency tracking.
     * @throws Error if any step within the stage fails.
     */
    async execute(completedStages: Set<string>): Promise<void> {
        // Skip disabled stages
        if (!this.enabled) {
            this.logInfo(`Stage "${this.name}" is disabled, skipping.`);
            completedStages.add(this.name);
            return;
        }

        // Handle dependencies before executing the stage
        if (this.dependsOn) {
            await this.resolveDependencies(completedStages);
        }

        const startTime = performance.now();
        this.logInfo(
            `Executing stage: ${this.name}${this.parallel ? " (parallel mode)" : ""}`,
        );

        // Execute with optional timeout. Hooks run inside the timeout so a
        // hanging hook cannot stall the pipeline past the stage budget.
        const executeSteps = async (): Promise<void> => {
            await this.runHook("before");
            if (this.parallel) {
                await this.executeStepsInParallel();
            } else {
                await this.executeStepsSequentially();
            }
            await this.runHook("after");
        };

        try {
            if (this.timeout) {
                await this.executeWithTimeout(executeSteps(), this.timeout);
            } else {
                await executeSteps();
            }

            const duration = performance.now() - startTime;
            this.logInfo(
                `Stage "${this.name}" completed successfully in ${duration.toFixed(2)}ms.`,
            );
            completedStages.add(this.name);
        } catch (error) {
            const duration = performance.now() - startTime;
            this.logError(
                `Error executing stage "${this.name}" after ${duration.toFixed(2)}ms: ${error}`,
                error,
            );
            // Propagate the error to halt pipeline or manage based on
            // global settings
            throw error;
        }
    }

    /**
     * Runs one of the stage's lifecycle hooks, if defined.
     *
     * @param phase - Which hook to run.
     */
    private async runHook(phase: "before" | "after"): Promise<void> {
        const hook = this.hooks?.[phase];
        if (!hook) return;

        this.logDebug(`Running "${phase}" hook for stage "${this.name}".`);
        await hook();
    }

    /**
     * Executes steps sequentially (default behavior).
     */
    private async executeStepsSequentially(): Promise<void> {
        for (const step of this.steps) {
            await step.execute();
        }
    }

    /**
     * Executes steps in parallel with optional concurrency limit.
     */
    private async executeStepsInParallel(): Promise<void> {
        if (
            !this.maxConcurrentSteps ||
            this.maxConcurrentSteps >= this.steps.length
        ) {
            // Execute all steps simultaneously
            await Promise.all(this.steps.map((step) => step.execute()));
        } else {
            // Execute with concurrency control
            await this.executeWithConcurrencyLimit(
                this.steps,
                this.maxConcurrentSteps,
            );
        }
    }

    /**
     * Executes steps with a concurrency limit.
     * @param steps - Array of steps to execute
     * @param maxConcurrent - Maximum number of concurrent executions
     */
    private async executeWithConcurrencyLimit(
        steps: Step[],
        maxConcurrent: number,
    ): Promise<void> {
        const executing = new Set<Promise<void>>();

        try {
            for (const step of steps) {
                const execution = step.execute();
                executing.add(execution);
                // Removal is attached to a derived promise so that `executing`
                // only ever holds the originals; the `catch` keeps this
                // bookkeeping branch from counting as an unhandled rejection.
                void execution
                    .finally(() => executing.delete(execution))
                    .catch(() => undefined);

                if (executing.size >= maxConcurrent) {
                    await Promise.race(executing);
                }
            }

            await Promise.all(executing);
        } catch (error) {
            // A step failed. Let the steps already running settle before
            // propagating, so their rejections are observed here rather than
            // surfacing later as unhandled rejection warnings.
            await Promise.allSettled(executing);
            throw error;
        }
    }

    /**
     * Executes a promise with a timeout.
     * @param promise - Promise to execute
     * @param timeout - Timeout in milliseconds
     */
    private async executeWithTimeout<T>(
        promise: Promise<T>,
        timeout: number,
    ): Promise<T> {
        let timer: NodeJS.Timeout | undefined;
        const expiry = new Promise<never>((_, reject) => {
            timer = setTimeout(
                () =>
                    reject(
                        new Error(
                            `Stage "${this.name}" timed out after ${timeout}ms`,
                        ),
                    ),
                timeout,
            );
        });

        try {
            return await Promise.race([promise, expiry]);
        } finally {
            // Always cleared: an uncleared timer keeps the event loop alive,
            // so a stage that finishes in milliseconds would otherwise hold
            // the process open until its whole timeout had elapsed.
            clearTimeout(timer);
        }
    }

    /**
     * Resolves dependencies by ensuring all required stages have completed.
     * @param completedStages - A set of completed stage names used for
     * dependency tracking.
     * @returns A promise that resolves once all dependencies are met.
     */
    private async resolveDependencies(
        completedStages: Set<string>,
    ): Promise<void> {
        // Only reached from `execute`, which already guards on `dependsOn`.
        const dependsOn = this.dependsOn as string[];

        this.logInfo(
            `Stage "${this.name}" is waiting for
            dependencies:${dependsOn.join(", ")}`,
        );
        await Promise.all(
            dependsOn.map((dep) =>
                this.waitForStageCompletion(dep, completedStages),
            ),
        );
        this.logInfo(`All dependencies resolved for stage: "${this.name}"`);
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
        completedStages: Set<string>,
    ): Promise<void> {
        while (!completedStages.has(stageName)) {
            await new Promise((resolve) =>
                setTimeout(
                    resolve,
                    100, // Polling interval to check completion status
                ),
            );
        }
    }
}
