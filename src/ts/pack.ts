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
// Utility Functions
// ============================================================================

/**
 * Parses the `--mode` flag from the CLI arguments.
 * Defaults to `development` if no mode is specified.
 * @returns The mode as a string (`development`, `production`, or `none`).
 */
function getMode(): string {
    const modeArgIndex = process.argv.findIndex((arg) => arg === "--mode");
    if (modeArgIndex !== -1 && process.argv[modeArgIndex + 1]) {
        return process.argv[modeArgIndex + 1];
    }
    console.warn(
        "[CLI] No `--mode` flag specified. Defaulting to `development` mode."
    );
    return "development";
}


// ============================================================================
// Main
// ============================================================================

/**
 * The main function initializes the pipeline with the loaded configuration,
 * and optionally sets up live reload functionality based on the "--live" flag.
 */
export async function main(mode: string): Promise<void> {
    try {

        console.log(`[CLI] Starting pipeline in ${mode} mode...`);

        // Determine if live reload is enabled based on the "--live" flag
        const isLiveReloadEnabled = process.argv.includes("--live");

        // Load the configuration using ConfigLoader
        const configLoader = new ConfigLoader();
        const config = configLoader.loadConfig();

        if (!config) {
            throw new Error(
                "Configuration file not found. Ensure 'pack.yaml' or 'pack.yml' exists in the working directory."
            );
        }

        // Create and run the pipeline
        const pipeline = new Pipeline(config);
        await pipeline.run();
        console.log(`[CLI] Pipeline execution finished successfully in ${mode} mode.`);

        // Set up live reload if enabled
        if (isLiveReloadEnabled) {
            setupLiveReload();
        }
    } catch (error) {
        console.error(
            "[CLI] An error occurred during the pipeline execution:",
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

    console.log(
        "[CLI] Live reload functionality is enabled."
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
                `[CLI] Detected change in: ${filePath}. Restarting pipeline...`
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
        "[CLI] Shutdown signal received. Shutting down..."
    );
    try {
        await pipelineManager.stopPipeline();
        await liveReloadServer.shutdown();
    } catch (error) {
        console.error(
            "[CLI] Error during shutdown:",
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
//             `[CLI] Invalid mode: "${mode}". Valid modes are: ${validModes.join(
//                 ", "
//             )}.`
//         );
//         process.exit(1);
//     }

//     main(mode);
// }