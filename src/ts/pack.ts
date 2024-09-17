// src/pack.ts


// ============================================================================
// Import
// ============================================================================

import { Pipeline } from './core/Pipeline';
import { ConfigLoader } from './core/ConfigLoader';
import { LiveReloadServer } from './core/LiveReloadServer';
import { FileWatcher } from './core/FileWatcher';
import { PipelineManager } from './core/PipelineManager';


// ============================================================================
// Constants
// ============================================================================

const PORT = 3000;
const WATCH_PATHS = ['src/**/*', 'config/**/*', 'pack.yaml'];
const IGNORED_PATHS = /node_modules/;


// ============================================================================
// Main
// ============================================================================

/**
 * The main function initializes the pipeline with the loaded configuration,
 * and optionally sets up live reload functionality based on the '--live' flag.
 */
async function main() {
    try {
        // Check for the '--live' flag in the command-line arguments
        const isLiveReloadEnabled = process.argv.includes('--live');

        // Initialize the ConfigLoader and load the configuration from the YAML file
        const configLoader = new ConfigLoader();
        const config = configLoader.loadConfig();

        // Create a new Pipeline instance with the loaded configuration
        const pipeline = new Pipeline(config);

        // Run the pipeline
        await pipeline.run();

        console.log('Pipeline execution finished successfully.');

        if (isLiveReloadEnabled) {
            // Initialize the live reload server
            const liveReloadServer = new LiveReloadServer(PORT);

            // Initialize the pipeline manager
            const pipelineManager = new PipelineManager(liveReloadServer);

            // Initialize the file watcher
            const fileWatcher = new FileWatcher(WATCH_PATHS, IGNORED_PATHS, (filePath) => {
                console.log(`Detected change in: ${filePath}. Restarting pipeline...`);
                pipelineManager.restartPipelineWithDelay(500); // Restart with delay to handle rapid changes
            });

            // Start the initial pipeline process with live reload capabilities
            pipelineManager.restartPipeline();

            // Gracefully shutdown on process termination signals
            process.on('SIGINT', async () => {
                console.log('Received SIGINT. Shutting down...');
                await pipelineManager.stopPipeline();
                await liveReloadServer.shutdown();
                process.exit(0);
            });

            process.on('SIGTERM', async () => {
                console.log('Received SIGTERM. Shutting down...');
                await pipelineManager.stopPipeline();
                await liveReloadServer.shutdown();
                process.exit(0);
            });
        }

    } catch (error) {
        console.error('An error occurred during the pipeline execution:', error);
        process.exit(1); // Exit with an error code to signal failure
    }
}


// ============================================================================
// Execute
// ============================================================================

// Execute the main function if the script is run directly
if (require.main === module) {
    main();
}
