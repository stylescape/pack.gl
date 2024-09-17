// src/pack.ts

import { Pipeline } from './core/Pipeline';
import { ConfigLoader } from './core/ConfigLoader'; // Updated import path for ConfigLoader

/**
 * The main function initializes the pipeline with the loaded configuration
 * and starts the pipeline execution.
 */
async function main() {
    try {
        // Initialize the ConfigLoader and load the configuration from the YAML file
        const configLoader = new ConfigLoader();
        const config = configLoader.loadConfig();

        // Create a new Pipeline instance with the loaded configuration
        const pipeline = new Pipeline(config);

        // Run the pipeline
        await pipeline.run();

        console.log('Pipeline execution finished successfully.');
    } catch (error) {
        console.error('An error occurred during the pipeline execution:', error);
        process.exit(1); // Exit with an error code to signal failure
    }
}

// Execute the main function if the script is run directly
if (require.main === module) {
    main();
}