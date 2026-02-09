// ============================================================================
// Import
// ============================================================================

import { ConfigInterface } from "../../interface/ConfigInterface.js";

// ============================================================================
// Constants
// ============================================================================

/**
 * Default configuration for the kist pipeline.
 */
export const defaultConfig: ConfigInterface = {
    metadata: {
        /**
         * The name of the pipeline for identification and reporting.
         */
        name: "kist pipeline",

        /**
         * Semantic version of the pipeline configuration for tracking changes.
         */
        version: "1.0.0",

        /**
         * Detailed description outlining the purpose of the pipeline.
         */
        description: "A generic pipeline configuration for kist.",

        /**
         * The author or owner of the pipeline configuration.
         */
        author: "Anonymous",

        /**
         * Arbitrary key-value pairs to describe the pipeline.
         */
        tags: {
            category: "generic",
            environment: "development",
        },

        /**
         * Timestamp indicating when the configuration was created or last updated.
         * Automatically set to the current date/time.
         */
        timestamp: new Date().toISOString(),

        /**
         * License under which the pipeline configuration is shared or used.
         */
        license: "MIT",

        /**
         * URL pointing to documentation or additional resources for the pipeline.
         */
        documentation: "https://example.com/documentation",

        /**
         * Contact information for questions or support.
         */
        contact: "support@example.com",

        /**
         * Dependencies or related systems required by the pipeline configuration.
         */
        dependencies: ["Node.js >=14.0", "Docker >=20.10"],

        /**
         * Environments where the pipeline is intended to run.
         */
        environments: ["local", "CI/CD", "staging", "production"],
    },

    options: {
        /**
         * Configuration settings for live reload functionality.
         */
        live: {
            /**
             * Indicates whether live reload is enabled.
             */
            enabled: false,

            /**
             * Port on which the live reload server listens.
             */
            port: 3000,

            /**
             * Root directory for serving static files.
             */
            root: "public",

            /**
             * Paths to watch for changes.
             */
            watchPaths: ["src/**/*", "config/**/*", "kist.yaml"],

            /**
             * Paths or patterns to ignore while watching.
             */
            ignoredPaths: ["node_modules/*"],
        },

        /**
         * Configuration options for pipeline execution.
         */
        pipeline: {
            /**
             * Default timeout in milliseconds for each step in the pipeline.
             */
            stepTimeout: 30000,

            /**
             * Whether to halt the pipeline if a step fails.
             */
            haltOnFailure: true,

            /**
             * Maximum number of concurrent stages allowed to run in parallel.
             * Set to 0 for no limit.
             */
            maxConcurrentStages: 0,

            /**
             * Retry strategy for steps that fail.
             */
            retryStrategy: {
                /**
                 * Number of retry attempts before marking a step as failed.
                 */
                retries: 3,

                /**
                 * Delay in milliseconds between retry attempts.
                 */
                delay: 1000,
            },
        },

        /**
         * Logging level for the pipeline.
         */
        logLevel: "info",
    },

    /**
     * Default stages for the pipeline. Initially set to an empty array.
     * Users can define and add their own stages.
     */
    stages: [],
};
