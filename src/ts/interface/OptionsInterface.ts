// ============================================================================
// Import
// ============================================================================

import { LiveOptionsInterface } from "./LiveOptionsInterface";
import { PipelineOptionsInterface } from "./PipelineOptionsInterface";


// ============================================================================
// Interfaces
// ============================================================================

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
     * @example "./config/pack.yaml"
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
     * Additional properties can be included dynamically.
     */
    [key: string]: unknown;

}
