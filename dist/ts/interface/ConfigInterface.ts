// src/interface/ConfigInterface.ts


// ============================================================================
// Import
// ============================================================================

import { GlobalOptionsInterface } from "./GlobalOptionsInterface";
import { StageInterface } from "./StageInterface";


// ============================================================================
// Interfaces
// ============================================================================

/**
 * ConfigInterface defines the overall configuration for the packaging
 * pipeline. This configuration determines the structure, behavior, and
 * execution flow of the entire pipeline, including stages, global settings,
 * and optional metadata.
 */
export interface ConfigInterface {

    /**
     * A list of stages to be executed in the pipeline. Stages run in parallel
     * by default, but dependencies specified in each stage can enforce a
     * specific execution order. Stages should be defined in the logical
     * sequence that aligns with the pipeline's objectives.
     */
    stages: StageInterface[];

    /**
     * Optional global options that apply universally across the entire
     * pipeline. These options can control aspects like logging levels, step
     * timeouts, error handling, concurrency limits, and other settings that
     * affect the overall pipeline behavior.
     */
    globalOptions?: GlobalOptionsInterface;

    /**
     * Optional metadata that provides additional context or descriptive
     * information about the pipeline configuration. This can include the
     * pipeline name, version, author, or any other relevant details. Useful
     * for documentation, tracking, and integration with external systems.
     */
    metadata?: {

        /**
         * A human-readable name for the pipeline, used for identification and
         * reporting.
         */
        name?: string;

        /**
         * The version of the pipeline configuration, useful for tracking
         * changes and maintaining different pipeline setups.
         */
        version?: string;

        /**
         * A description of the pipeline's purpose, objectives, or key details,
         * providing context for users and maintainers.
         */
        description?: string;

        /**
         * The author or owner of the pipeline configuration, helpful for
         * communication and maintenance purposes.
         */
        author?: string;

        /**
         * Additional arbitrary tags or properties that provide further details
         * about the pipeline.
         */
        tags?: Record<string, string>;

    };

    /**
     * An optional function or set of rules for validating the configuration
     * before execution. This can be used to ensure that the pipeline meets
     * certain criteria or standards before running, catching potential
     * configuration errors early.
     * 
     * @param config - The full configuration object to validate.
     * @returns A boolean indicating whether the configuration is valid, or
     *      throws an error if validation fails.
     */
    validateConfig?(config: ConfigInterface): boolean;

}
