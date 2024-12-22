// src/interface/GlobalOptionsInterface.ts


// ============================================================================
// Interfaces
// ============================================================================

/**
 * GlobalOptionsInterface represents the global configuration options that
 * apply to the entire pipeline. These settings provide overarching controls
 * that affect how all stages and steps within the pipeline operate.
 */
export interface GlobalOptionsInterface {
    /**
     * Specifies the level of logging to be used throughout the pipeline.
     * The available levels are:
     * - 'verbose': Provides detailed logging, useful for debugging and
     *      tracing execution flow.
     * - 'info': Standard logging level, providing key information about
     *      pipeline progress and outcomes.
     * - 'warn': Logs only warnings and errors, useful for highlighting
     *      potential issues without excessive details.
     * - 'error': Logs only errors, minimizing output to essential problem
     *      notifications. Default is 'info'.
     */
    logLevel?: 'verbose' | 'info' | 'warn' | 'error';

    /**
     * Specifies the default timeout in milliseconds for each step within the
     * pipeline. If a step exceeds this duration, it will be forcibly
     * terminated to prevent blocking the pipeline. This setting helps manage
     * steps that could potentially hang or take longer than expected.
     */
    stepTimeout?: number;

    /**
     * Specifies whether to halt the entire pipeline if a step fails.
     * - true: The pipeline will stop execution immediately upon encountering a failed step.
     * - false: The pipeline will continue executing subsequent steps and stages despite errors.
     * Default is true (halt on failure), ensuring the pipeline stops at the
     * first sign of trouble.
     */
    haltOnFailure?: boolean;

    /**
     * Specifies the maximum number of concurrent stages allowed to run in
     * parallel. This setting controls resource usage and can help prevent
     * overloading the system.
     * - 0 or undefined: No limit, all stages run in parallel as allowed by their dependencies.
     * - A positive integer: Limits the number of stages that can run simultaneously.
     */
    maxConcurrentStages?: number;

    /**
     * Specifies a retry strategy for steps that fail.
     * - retries: Number of retry attempts before a step is considered failed.
     * - delay: Delay in milliseconds between retry attempts.
     * This setting allows for temporary issues to be retried automatically,
     * improving pipeline robustness.
     */
    retryStrategy?: {
        retries: number;
        delay: number;
    };

    /**
     * Specifies the environment for the pipeline execution.
     * This can be used to differentiate between different environments (e.g.,
     * 'development', 'staging', 'production').
     * Custom settings or behaviors can be defined based on this environment.
     */
    environment?: string;

    /**
     * Optional global tags or metadata to attach to all stages and steps
     * within the pipeline. Useful for logging, reporting, or integrating
     * with other tools and systems that track execution context.
     */
    tags?: Record<string, string>;
}
