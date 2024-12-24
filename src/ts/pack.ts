// ============================================================================
// Imports
// ============================================================================

import { Pipeline } from "./core/Pipeline";
import { ConfigLoader } from "./core/config/ConfigLoader";
import { LiveReloadServer } from "./live/LiveReloadServer";
import { FileWatcher } from "./live/FileWatcher";
import { PipelineManager } from "./core/PipelineManager";
import { Logger } from "./utils/Logger";
import { ActionRegistry } from "./core/ActionRegistry"; // Import ActionRegistry


// ============================================================================
// Constants
// ============================================================================

const PORT = 3000;
const WATCH_PATHS = [
    "src/**/*",
    "config/**/*",
    "pack.yaml"
];
const IGNORED_PATHS = /node_modules/;

/** 
 * The context string for logging.
 */
const CONTEXT = "Pack Main";


// ============================================================================
// Main
// ============================================================================

/**
 * The main function initializes the pipeline with the loaded configuration,
 * and optionally sets up live reload functionality based on the "--live" flag.
 */
export async function main(
    mode: string
): Promise<void> {

    // Initialize the Logger
    const logger = Logger.getInstance();

    try {


        logger.log(CONTEXT, `Starting pipeline in ${mode} mode...`);
;


        // Initialize the ActionRegistry singleton
        logger.log(CONTEXT, "Initializing ActionRegistry...");
        ActionRegistry.initialize();
        logger.log(CONTEXT, "ActionRegistry initialized successfully.");


        // Determine if live reload is enabled based on the "--live" flag
        const isLiveReloadEnabled = process.argv.includes("--live");

        // Load the configuration using ConfigLoader
        logger.log(CONTEXT, "Loading pipeline configuration...");
        const configLoader = new ConfigLoader();
        const config = configLoader.loadConfig();

        if (!config) {
            throw new Error(
                "Configuration file not found. Ensure 'pack.yaml' or 'pack.yml' exists in the working directory."
            );
        }

        // Create and run the pipeline
        logger.log(CONTEXT, "Initializing pipeline...");
        const pipeline = new Pipeline(config);
        await pipeline.run();
        logger.log(CONTEXT, "Pipeline execution finished successfully.");


        // Set up live reload if enabled
        if (isLiveReloadEnabled) {
            setupLiveReload();
        }

    } catch (error) {


        logger.error("main", `An error occurred during the pipeline execution: ${error instanceof Error ? error.message : error}`, error);

        // Exit with an error code to signal failure
        process.exit(1);
    }

}

/**
 * Sets up live reload functionality, including the server, file watcher, and
 * pipeline manager.
 */
function setupLiveReload(): void {

    console.log(
        "[pack.gl CLI] Live reload functionality is enabled."
    );

    // Initialize the live reload server
    const liveReloadServer = new LiveReloadServer(PORT);

    // Initialize the pipeline manager
    const pipelineManager = new PipelineManager(liveReloadServer);

    // Initialize the file watcher
    const fileWatcher = new FileWatcher(
        WATCH_PATHS,
        IGNORED_PATHS,
        (filePath) => {
            console.log(
                `[pack.gl CLI] Detected change in: ${filePath}. Restarting pipeline...`
            );

            // Restart pipeline with a delay to handle rapid changes
            pipelineManager.restartPipelineWithDelay(500);
        }
    );

    // Start the initial pipeline process with live reload capabilities
    pipelineManager.restartPipeline();

    // Set up graceful shutdown handlers
    process.on(
        "SIGINT",
        () => handleShutdown(
            pipelineManager,
            liveReloadServer
        )
    );
    process.on(
        "SIGTERM",
        () => handleShutdown(
            pipelineManager,
            liveReloadServer
        )
    );
}

/**
 * Handles the shutdown of the pipeline and live reload server.
 * 
 * @param pipelineManager - The pipeline manager instance.
 * @param liveReloadServer - The live reload server instance.
 */
async function handleShutdown(
    pipelineManager: PipelineManager,
    liveReloadServer: LiveReloadServer,
): Promise<void> {
    console.log(
        "[pack.gl CLI] Shutdown signal received. Shutting down..."
    );
    try {
        await pipelineManager.stopPipeline();
        await liveReloadServer.shutdown();
    } catch (error) {
        console.error(
            "[pack.gl CLI] Error during shutdown:",
            error
        );
    } finally {
        // Exit gracefully
        process.exit(0);
    }
}



// ============================================================================
// Execute
// ============================================================================

/**
 * Execute the script only if the `--mode` flag is provided, and a valid mode
 * (`development`, `production`, or `none`) is specified.
 */
// if (require.main === module) {
//     const mode = getMode();
//     const validModes = ["development", "production", "none"];

//     if (!validModes.includes(mode)) {
//         console.error(
//             `[pack.gl CLI] Invalid mode: "${mode}". Valid modes are: ${validModes.join(
//                 ", "
//             )}.`
//         );
//         process.exit(1);
//     }

//     main(mode);
// }