#!/usr/bin/env node

// ============================================================================
// Imports
// ============================================================================

import { ArgumentParser } from "./cli/ArgumentParser.js";
import { ConfigLoader } from "./core/config/ConfigLoader.js";
import { ConfigStore } from "./core/config/ConfigStore.js";
import { Kist } from "./kist.js";
import { Logger } from "./logger/Logger.js";

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * The entry point for the Kist CLI application. Sets up the runtime
 * environment, loads configuration, and invokes the Kist class.
 */
(async (): Promise<void> => {
    try {
        // Initialize CLI argument parser
        const parser = new ArgumentParser();
        const cliOptions = parser.getAllFlags();

        // `--live` arrives as a bare boolean; expand it to the object shape
        // the config uses so it enables live reload instead of clobbering
        // the `options.live` block from the config file.
        if (cliOptions.live === true) {
            (cliOptions as Record<string, unknown>).live = { enabled: true };
        }

        // Initialize ConfigStore
        const configStore = ConfigStore.getInstance();

        // Initialize ConfigStore and load configuration
        const configLoader = new ConfigLoader();
        await configLoader.initialize();
        const fileConfig = await configLoader.loadConfig();

        // Merge Configs
        configStore.merge(fileConfig); // Merge file-based config
        configStore.merge({ options: cliOptions }); // Merge CLI options

        // Apply the configured log level; `--verbose` forces debug logging.
        const logLevel = configStore.get<
            "debug" | "info" | "warn" | "error" | undefined
        >("options.logLevel");
        if (cliOptions.verbose === true) {
            Logger.getInstance().setLogLevel("debug");
        } else if (logLevel) {
            Logger.getInstance().setLogLevel(logLevel);
        }

        // Create a Kist instance and execute the workflow
        const kist = new Kist();
        await kist.run();
    } catch (error) {
        // Last-resort handler: the Logger itself may be the failing piece.
        // eslint-disable-next-line no-console
        console.error(`[CLI] An unexpected error occurred:`, error);
        process.exit(1);
    }
})();

/**
 * Note: The `#!/usr/bin/env node` shebang ensures that the script can be executed
 * directly as a Node.js script on compatible systems.
 */
