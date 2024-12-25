// ============================================================================
// Imports
// ============================================================================

import { Pipeline } from "./core/pipeline/Pipeline";
import { ConfigLoader } from "./core/config/ConfigLoader";
import { LiveServer } from "./live/LiveServer";
import { LiveWatcher } from "./live/LiveWatcher";
import { PipelineManager } from "./core/pipeline/PipelineManager";
import { Logger } from "./utils/Logger";
import { ActionRegistry } from "./core/pipeline/ActionRegistry";

// ============================================================================
// Constants
// ============================================================================

const PORT = 3000;
const WATCH_PATHS = ["src/**/*", "config/**/*", "pack.yaml"];
const IGNORED_PATHS = /node_modules/;
const CONTEXT = "Pack Main"; // The context string for logging

// ============================================================================
// Main Functionality
// ============================================================================

/**
 * Main function initializes the pipeline and optionally sets up live reload functionality.
 *
 * @param mode - The execution mode ("development", "production", or "none").
 */
export async function main(mode: string): Promise<void> {
    const logger = Logger.getInstance();

    try {
        logger.logInfo(CONTEXT, `Starting pipeline in ${mode} mode...`);

        // Initialize ActionRegistry
        logger.logInfo(CONTEXT, "Initializing ActionRegistry...");
        ActionRegistry.initialize();
        logger.logInfo(CONTEXT, "ActionRegistry initialized successfully.");

        // Check for live reload flag
        const isLiveReloadEnabled = process.argv.includes("--live");

        // Load configuration
        logger.logInfo(CONTEXT, "Loading pipeline configuration...");
        const configLoader = new ConfigLoader();
        await configLoader.initialize(); // Call the async initialization method
        const config = await configLoader.loadConfig();

        if (!config) {
            throw new Error(
                "Configuration file not found. Ensure 'pack.yaml' or 'pack.yml' exists in the working directory."
            );
        }

        // Initialize and run the pipeline
        logger.logInfo(CONTEXT, "Initializing pipeline...");
        const pipeline = new Pipeline(config);
        await pipeline.run();
        logger.logInfo(CONTEXT, "Pipeline execution finished successfully.");

        // Set up live reload if enabled
        if (isLiveReloadEnabled) {
            setupLiveReload();
        }
    } catch (error) {
        handleMainError(error, logger);
    }
}

/**
 * Handles errors occurring during the main pipeline execution.
 *
 * @param error - The error object.
 * @param logger - The Logger instance for logging.
 */
function handleMainError(error: unknown, logger: Logger): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.logError(CONTEXT, `An error occurred during the pipeline execution: ${errorMessage}`, error);

    // Exit with error code to signal failure
    process.exit(1);
}

/**
 * Sets up live reload functionality, including the server, file watcher, and pipeline manager.
 */
function setupLiveReload(): void {
    const logger = Logger.getInstance();
    logger.logInfo(CONTEXT, "Enabling live reload functionality...");

    // Initialize components
    const liveReloadServer = new LiveServer(PORT);
    const pipelineManager = new PipelineManager(liveReloadServer);
    const fileWatcher = new LiveWatcher(WATCH_PATHS, IGNORED_PATHS, (filePath) => {
        logger.logInfo(CONTEXT, `Detected change in: ${filePath}. Restarting pipeline...`);
        pipelineManager.restartPipelineWithDelay(500);
    });

    // Start initial pipeline process with live reload capabilities
    pipelineManager.restartPipeline();

    // Set up graceful shutdown handlers
    process.on("SIGINT", () => handleShutdown(pipelineManager, liveReloadServer));
    process.on("SIGTERM", () => handleShutdown(pipelineManager, liveReloadServer));
}

/**
 * Handles graceful shutdown of the pipeline and live reload server.
 *
 * @param pipelineManager - The pipeline manager instance.
 * @param liveReloadServer - The live reload server instance.
 */
async function handleShutdown(pipelineManager: PipelineManager, liveReloadServer: LiveServer): Promise<void> {
    const logger = Logger.getInstance();
    logger.logInfo(CONTEXT, "Shutdown signal received. Shutting down...");

    try {
        await pipelineManager.stopPipeline();
        await liveReloadServer.shutdown();
        logger.logInfo(CONTEXT, "Shutdown completed successfully.");
    } catch (error) {
        logger.logError(CONTEXT, "Error during shutdown.", error);
    } finally {
        process.exit(0); // Exit gracefully
    }
}

// ============================================================================
// Execute
// ============================================================================

if (require.main === module) {
    const validModes = ["development", "production", "none"];
    const modeIndex = process.argv.indexOf("--mode");

    if (modeIndex === -1 || !validModes.includes(process.argv[modeIndex + 1])) {
        console.error(`[pack.gl CLI] Invalid or missing mode. Valid modes: ${validModes.join(", ")}.`);
        process.exit(1);
    }

    const mode = process.argv[modeIndex + 1];
    main(mode).catch((error) => {
        console.error("[pack.gl CLI] Unhandled exception:", error);
        process.exit(1);
    });
}