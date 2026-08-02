// ============================================================================
// Import
// ============================================================================

import type { ActionInterface } from "../../interface/ActionInterface.js";
import type { StepInterface } from "../../interface/StepInterface.js";
import { describeUnknownAction } from "../../config/actionHints.js";
import { ActionError, KistError, TimeoutError } from "../../errors/index.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import type { StepCache } from "../cache/StepCache.js";
import { ActionRegistry } from "./ActionRegistry.js";

// ============================================================================
// Types
// ============================================================================

/**
 * Pipeline-wide settings a step needs at execution time. Supplied by the
 * Pipeline through the Stage so that a step can honour global defaults
 * without reaching back into the configuration store.
 */
export interface StepRuntimeOptions {
    /**
     * Timeout applied to steps that do not declare their own, in
     * milliseconds. Zero or undefined means no default timeout.
     */
    defaultTimeout?: number;

    /**
     * Number of times to retry a failing step before giving up.
     */
    retries?: number;

    /**
     * Delay between retry attempts, in milliseconds.
     */
    retryDelay?: number;

    /**
     * Default cap on concurrent steps inside a parallel stage that does not
     * set its own `maxConcurrentSteps`.
     */
    maxConcurrentSteps?: number;

    /**
     * Cache used to skip steps whose inputs are unchanged. Null when caching
     * is disabled.
     */
    cache?: StepCache | null;
}

// ============================================================================
// Class
// ============================================================================

/**
 * Represents a single step in a stage, encapsulating its execution logic.
 * This class manages the resolution and execution of actions associated
 * with each step, along with the per-step controls declared in the
 * configuration: enablement, timeout, retries, hooks, and caching.
 */
export class Step extends AbstractProcess {
    // Parameters
    // ========================================================================

    private name: string;
    private actionName: string;
    private action: ActionInterface;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private options?: Record<string, any>;
    private enabled: boolean;
    private timeout?: number;
    private description?: string;
    private tags?: Record<string, string>;
    private hooks?: StepInterface["hooks"];
    private inputs?: string[];
    private outputs?: string[];
    private env?: string[];
    private runtime: StepRuntimeOptions;

    // Constructor
    // ========================================================================

    /**
     * Constructs a Step instance based on the provided step definition.
     * Dynamically resolves the action class from the registry.
     *
     * @param step - The step definition containing the step name, action name,
     * and options.
     * @param runtime - Pipeline-wide execution settings.
     * @throws Error if the specified action is not registered in the action
     * registry. The message names the plugin package to install when the
     * action has moved out of core, and suggests a close match otherwise.
     */
    constructor(step: StepInterface, runtime: StepRuntimeOptions = {}) {
        super();
        this.name = step.name;
        this.runtime = runtime;

        // Resolve the action class from the registry using the action name
        const actionRegistry = ActionRegistry.getInstance();
        this.actionName = String(step.action);
        const ActionClass = actionRegistry.getAction(this.actionName);
        if (!ActionClass) {
            const msg = describeUnknownAction(
                this.actionName,
                this.name,
                actionRegistry.listRegisteredActions(),
            );
            this.logError(msg);
            throw new Error(msg);
        }

        // Initialize the action with the specific class from the registry
        this.action = new ActionClass();
        this.options = step.options;
        this.enabled = step.enabled ?? true;
        this.timeout = step.timeout;
        this.description = step.description;
        this.tags = step.tags;
        this.hooks = step.hooks;
        this.inputs = step.inputs;
        this.outputs = step.outputs;
        this.env = step.env;

        this.logInfo(
            `Step "${this.name}" initialized with action "${this.actionName}".`,
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
     * The step's name, used by the planner and progress reporting.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * The registered name of the action this step runs.
     */
    public getActionName(): string {
        return this.actionName;
    }

    /**
     * Whether this step is enabled and will execute.
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    // Methods
    // ========================================================================

    /**
     * Executes the step by invoking its action's execute method.
     *
     * Disabled steps return immediately. Steps that declare `inputs` are
     * served from the cache when their inputs are unchanged. Failures are
     * retried according to the pipeline's retry strategy before propagating.
     *
     * @throws ActionError if option validation or action execution fails, so
     * the failure propagates to the stage and pipeline instead of being
     * silently swallowed.
     */
    async execute(): Promise<void> {
        if (!this.enabled) {
            this.logInfo(`Step "${this.name}" is disabled, skipping.`);
            return;
        }

        this.logInfo(`Executing step: ${this.name}`);

        const cache = this.runtime.cache;
        const cacheable = Boolean(cache && this.inputs?.length);
        let hash: string | undefined;

        if (cache && cacheable) {
            hash = cache.computeHash({
                actionName: this.actionName,
                options: this.options ?? {},
                inputs: this.inputs as string[],
                env: this.env,
            });

            if (await cache.restore(hash)) {
                this.logInfo(
                    `Step "${this.name}" is up to date (cache hit), replaying output.`,
                );
                return;
            }
        }

        // Capture the step's output so a later cache hit can reproduce it.
        this.logger.beginCapture();
        let captured: string[];

        try {
            await this.runHook("before");
            await this.runWithRetries();
            await this.runHook("after");
            this.logInfo(`Step "${this.name}" completed successfully.`);
        } catch (error) {
            this.logError(
                `Error executing step "${this.name}": ${error}`,
                error,
            );
            if (error instanceof KistError) {
                throw error;
            }
            throw new ActionError(
                this.actionName,
                error instanceof Error ? error.message : String(error),
                { stepName: this.name },
                error instanceof Error ? error : undefined,
            );
        } finally {
            captured = this.logger.endCapture();
        }

        if (cache && hash) {
            await cache.record(hash, captured, this.outputs ?? []);
        }
    }

    /**
     * Runs the action, retrying on failure according to the pipeline's retry
     * strategy. The final failure is rethrown.
     */
    private async runWithRetries(): Promise<void> {
        const retries = Math.max(0, this.runtime.retries ?? 0);
        const delay = Math.max(0, this.runtime.retryDelay ?? 0);

        for (let attempt = 0; ; attempt++) {
            try {
                await this.runAction();
                return;
            } catch (error) {
                if (attempt >= retries) {
                    throw error;
                }
                this.logWarn(
                    `Step "${this.name}" failed (attempt ${attempt + 1} of ${retries + 1}), retrying in ${delay}ms.`,
                );
                if (delay > 0) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
    }

    /**
     * Validates options and invokes the action once, applying the step's
     * timeout if one is configured.
     *
     * Note that a timeout rejects the step but cannot abort work already
     * running inside the action; it bounds how long the pipeline waits, not
     * how long the action runs.
     */
    private async runAction(): Promise<void> {
        // Validate options if the action provides a validation method
        if (typeof this.action.validateOptions === "function") {
            const isValid = this.action.validateOptions(this.options || {});
            if (!isValid) {
                throw new Error(`Invalid options for step: ${this.name}`);
            }
        }

        const timeout = this.timeout ?? this.runtime.defaultTimeout;
        const execution = this.action.execute(this.options || {});

        if (!timeout || timeout <= 0) {
            await execution;
            return;
        }

        let timer: NodeJS.Timeout | undefined;
        const expiry = new Promise<never>((_, reject) => {
            timer = setTimeout(
                () => reject(new TimeoutError(`step "${this.name}"`, timeout)),
                timeout,
            );
        });

        try {
            await Promise.race([execution, expiry]);
        } finally {
            // Always cleared, so a step that finishes early does not hold the
            // event loop open until its timeout would have fired.
            clearTimeout(timer);
        }
    }

    /**
     * Runs one of the step's lifecycle hooks, if defined.
     *
     * @param phase - Which hook to run.
     */
    private async runHook(phase: "before" | "after"): Promise<void> {
        const hook = this.hooks?.[phase];
        if (!hook) return;

        this.logDebug(`Running "${phase}" hook for step "${this.name}".`);
        await hook();
    }
}
