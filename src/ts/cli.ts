#!/usr/bin/env node

// ============================================================================
// Imports
// ============================================================================

import { ArgumentParser } from "./cli/ArgumentParser";
import { ConfigLoader } from "./core/config/ConfigLoader";
import { ConfigStore } from "./core/config/ConfigStore";
import { Pack } from "./pack";

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

        // Initialize ConfigStore
        const configStore = ConfigStore.getInstance();

        // Initialize ConfigStore and load configuration
        const configLoader = new ConfigLoader();
        await configLoader.initialize();
        const fileConfig = await configLoader.loadConfig();

        // Merge Configs
        // configStore.print()
        configStore.merge(fileConfig); // Merge file-based config
        // configStore.print()
        configStore.merge({ options: cliOptions }); // Merge CLI options
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
