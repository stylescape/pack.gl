// ============================================================================
// Imports
// ============================================================================

import { Pipeline } from "./core/Pipeline";
import { ConfigLoader } from "./core/ConfigLoader";
import { LiveReloadServer } from "./live/LiveReloadServer";
import { FileWatcher } from "./live/FileWatcher";
import { PipelineManager } from "./core/PipelineManager";


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


// ============================================================================
// Main
// ============================================================================

/**
 * The main function initializes the pipeline with the loaded configuration,
 * and optionally sets up live reload functionality based on the "--live" flag.
 */
export async function main(): Promise<void> {
    try {

        // Determine if live reload is enabled based on the "--live" flag
        const isLiveReloadEnabled = process.argv.includes("--live");

        // Load the configuration using ConfigLoader
        const configLoader = new ConfigLoader();
        const config = configLoader.loadConfig();

        // Create and run the pipeline
        const pipeline = new Pipeline(config);
        await pipeline.run();
        console.log(
            "Pipeline execution finished successfully."
        );

        // Set up live reload if enabled
        if (isLiveReloadEnabled) {
            setupLiveReload();
        }

    } catch (error) {
        console.error(
            "An error occurred during the pipeline execution:",
            error
        );
        // Exit with an error code to signal failure
        process.exit(1);
    }
}

/**
 * Sets up live reload functionality, including the server, file watcher, and
 * pipeline manager.
 */
function setupLiveReload(): void {

    console.log("Live reload functionality is enabled.");

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
                `Detected change in: ${filePath}. Restarting pipeline...`
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
    console.log("Shutdown signal received. Shutting down...");
    try {
        await pipelineManager.stopPipeline();
        await liveReloadServer.shutdown();
    } catch (error) {
        console.error("Error during shutdown:", error);
    } finally {
        // Exit gracefully
        process.exit(0);
    }
}


// ============================================================================
// Execute
// ============================================================================

// Execute the main function if the script is run directly
if (require.main === module) {
    main();
}
