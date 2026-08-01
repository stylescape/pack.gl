// ============================================================================
// Import
// ============================================================================

import type { LiveOptionsInterface } from "./LiveOptionsInterface.js";
import type { PipelineOptionsInterface } from "./PipelineOptionsInterface.js";

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Configuration options for the caching system.
 */
export interface CacheOptionsInterface {
    /**
     * Whether caching is enabled globally.
     * @default false
     */
    enabled?: boolean;

    /**
     * Directory to store cache files.
     * @default ".kist-cache"
     */
    cacheDir?: string;

    /**
     * Maximum cache size in bytes.
     * @default 1073741824 (1GB)
     */
    maxCacheSize?: number;

    /**
     * Cache time-to-live in milliseconds.
     * @default 604800000 (7 days)
     */
    ttl?: number;

    /**
     * Whether to persist cache between builds.
     * @default true
     */
    persistent?: boolean;
}

/**
 * Configuration options for performance tuning.
 */
export interface PerformanceOptionsInterface {
    /**
     * Maximum number of concurrent stages.
     * @default unlimited
     */
    maxConcurrentStages?: number;

    /**
     * Maximum number of concurrent steps within a parallel stage.
     * @default unlimited
     */
    maxConcurrentSteps?: number;

    /**
     * Whether to enable parallel processing where applicable.
     * @default true
     */
    parallelProcessing?: boolean;

    /**
     * File size threshold (in bytes) for using streaming operations.
     * Files larger than this will be processed using streams.
     * @default 5242880 (5MB)
     */
    streamingThreshold?: number;

    /**
     * Whether to show progress indicators for long-running operations.
     * @default true
     */
    showProgress?: boolean;

    /**
     * Minimum operation duration (ms) before showing progress.
     * @default 1000
     */
    progressMinDuration?: number;
}

/**
 * OptionsInterface represents the global configuration options that
 * apply to the entire pipeline. These settings provide overarching controls
 * that affect how all stages and steps within the pipeline operate.
 */
export interface OptionsInterface {
    /**
     * Configuration settings for live reload functionality, enabling
     * real-time updates during development.
     */
    live?: LiveOptionsInterface;

    /**
     * Pipeline-specific configuration options.
     */
    pipeline?: PipelineOptionsInterface;

    /**
     * Path to the configuration file. This can be used to override default
     * or automatically located configuration files.
     *
     * @example "./config/kist.yaml"
     */
    configPath?: string;

    /**
     * Specifies the level of logging to be used throughout the pipeline.
     *
     * The available levels are:
     * - "debug": Provides detailed logging, useful for debugging and
     *      tracing execution flow.
     * - "info": Standard logging level, providing key information about
     *      pipeline progress and outcomes.
     * - "warn": Logs only warnings and errors, useful for highlighting
     *      potential issues without excessive details.
     * - "error": Logs only errors, minimizing output to essential problem
     *      notifications. Default is "info".
     *
     * @default "info"
     */
    logLevel?: "debug" | "info" | "warn" | "error";

    /**
     * Configuration options for the build caching system.
     * Enables incremental builds by caching file hashes and build outputs.
     */
    cache?: CacheOptionsInterface;

    /**
     * Performance tuning options for optimizing build speed.
     */
    performance?: PerformanceOptionsInterface;

    /**
     * Whether to halt the pipeline on the first error.
     * @default true
     */
    haltOnFailure?: boolean;

    /**
     * Maximum number of concurrent stages (deprecated: use performance.maxConcurrentStages).
     * @deprecated Use performance.maxConcurrentStages instead
     */
    maxConcurrentStages?: number;

    /**
     * Additional properties can be included dynamically.
     */
    [key: string]: unknown;
}
