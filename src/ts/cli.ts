#!/usr/bin/env node

// ============================================================================
// Imports
// ============================================================================

import { main } from "./pack";
import { Logger } from "./utils/Logger";
import { ArgumentParser } from "./cli/ArgumentParser";

// ============================================================================
// Constants
// ============================================================================

/** 
 * The context string for logging.
 */
const CONTEXT = "Pack CLI";

const VALID_MODES = ["development", "production", "none"];

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * The entry point for the Pack CLI application.
 * This script sets up the runtime environment, parses arguments, validates the mode,
 * and invokes the main pipeline logic. It handles any unexpected errors gracefully.
 */
(async () => {
    const logger = Logger.getInstance();

    try {
        // Initialize CLI argument parser
        const parser = new ArgumentParser();

        // Retrieve the mode
        const mode = parser.getOption("mode", { default: "none" });

        // Ensure mode is a string before validation
        if (typeof mode !== "string" || !VALID_MODES.includes(mode)) {
            logger.logError(
                CONTEXT,
                `Invalid mode: "${mode}". Valid modes are: ${VALID_MODES.join(", ")}.`
            );
            process.exit(1);
        }

        // Initialize the Logger with verbose mode in development
        const isVerbose = mode === "development";
        // Logger.initialize(isVerbose);
        logger.logInfo(CONTEXT, `Logger initialized with verbose=${isVerbose}.`);
        logger.logInfo(CONTEXT, `Running in ${mode} mode...`);

        // Execute the main function
        await main(mode);

    } catch (error) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.logError(CONTEXT, `An unexpected error occurred: ${errorMessage}`, error);

        // Exit with a failure code
        process.exit(1);
    }
})();

/**
 * Note: The `#!/usr/bin/env node` shebang ensures that the script can be executed
 * directly as a Node.js script on compatible systems.
 */