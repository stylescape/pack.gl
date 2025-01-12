// ============================================================================
// Interfaces
// ============================================================================

/**
 * PipelineOptionsInterface defines settings for managing the pipeline's
 * execution behavior, including timeouts, failure handling, concurrency,
 * and retry strategies.
 */
export interface PipelineOptionsInterface {
    /**
     * Default timeout in milliseconds for each step within the pipeline.
     *
     * If a step exceeds this duration, it will be forcibly terminated to
     * prevent blocking the pipeline. This setting helps manage steps that
     * might hang or take longer than expected.
     *
     * @default 30000
     * @example 15000
     */
    stepTimeout?: number;

    /**
     * Specifies whether to halt the entire pipeline if a step fails.
     * - true: The pipeline will stop execution immediately upon encountering
     *      a failed step.
     * - false: The pipeline will continue executing subsequent steps and
     *      stages despite errors.
     *
     * Default is true (halt on failure), ensuring the pipeline stops at the
     * first sign of trouble.
     *
     * @default true
     */
    haltOnFailure?: boolean;

    /**
     * Specifies the maximum number of concurrent stages allowed to run in
     * parallel. This setting controls resource usage and can help prevent
     * overloading the system.
     *
     * - `0` or `undefined`: No limit, all stages run in parallel (as allowed
     *   by their dependencies).
     * - A positive integer: Limits the number of stages that can run
     *   simultaneously.
     *
     * @default undefined
     */
    maxConcurrentStages?: number;

    /**
     * Specifies a retry strategy for steps that fail.
     *
     * - `retries`: Number of retry attempts before marking a step as failed.
     * - `delay`: Time in milliseconds between retry attempts.
     *
     * This allows automatic retries for temporary failures, improving
     * pipeline robustness.
     *
     * @default { retries: 0, delay: 0 }
     * @example { retries: 3, delay: 1000 }
     */
    retryStrategy?: {
        /**
         * Number of retry attempts before marking a step as failed.
         */
        retries: number;

        /**
         * Time in milliseconds between retry attempts.
         */
        delay: number;
    };
}
