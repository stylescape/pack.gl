#!/usr/bin/env node

// ============================================================================
// Imports
// ============================================================================

import { Pack } from "./pack";
import { ArgumentParser } from "./cli/ArgumentParser";
import { ConfigStore } from "./core/config/ConfigStore";
import { ConfigLoader } from "./core/config/ConfigLoader";


// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * The entry point for the Pack CLI application. Sets up the runtime
 * environment, loads configuration, and invokes the Pack class.
 */
(async () => {
    try {
        // console.log("Raw arguments:", process.argv);

        // Initialize CLI argument parser
        const parser = new ArgumentParser();
        const cliOptions = parser.getAllFlags();
        // console.log(cliOptions)


        // Initialize ConfigStore and load configuration
        const configStore = ConfigStore.getInstance();
        const configLoader = await new ConfigLoader();
        await configLoader.initialize()
        const fileConfig = await configLoader.loadConfig();
        // configStore.print()
        configStore.merge(fileConfig); // Merge file-based config
        // console.log(fileConfig)
        // configStore.print()
        configStore.merge({ options: cliOptions }); // Merge CLI options
        // console.log(cliOptions)
        // configStore.print()

        // Create a Pack instance and execute the workflow
        const pack = new Pack();
        await pack.run();

    } catch (error) {
        console.error(`[CLI] An unexpected error occurred:`, error);
        process.exit(1);
    }
})();

/**
 * Note: The `#!/usr/bin/env node` shebang ensures that the script can be executed
 * directly as a Node.js script on compatible systems.
 */
