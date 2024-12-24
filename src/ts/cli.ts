#!/usr/bin/env node


// ============================================================================
// Import
// ============================================================================

import { main } from "./pack";
import { getMode } from "./cli/getMode"
import { Logger } from "./utils/Logger";


// ============================================================================
// Constants
// ============================================================================

/** 
 * The context string for logging.
 */
const CONTEXT = "CLI";


// ============================================================================
// Main
// ============================================================================

/**
 * The entry point for the Pack CLI application.
 * This script sets up the runtime environment, invokes the `main` function
 * from `pack.ts`, and handles any unexpected errors during execution.
 */
(
    async () => {

        try {

            // Retrieve the mode from the CLI arguments
            const mode = getMode();
            const validModes = [
                "development",
                "production",
                "none"
            ];

            // Validate the mode
            if (!validModes.includes(mode)) {
                console.error(
                    `[${CONTEXT}] Invalid mode: "${mode}". Valid modes are: ${validModes.join(
                        ", "
                    )}.`
                );
                process.exit(1);
            }

            // Initialize the Logger with the verbose flag based on mode or configuration
            const verbose = mode === "development"; // Example: Enable verbose logging in development mode
            Logger.initialize(verbose);

            // Log the startup message
            const logger = Logger.getInstance();
            logger.log(CONTEXT, `Running in ${mode} mode...`);

            /**
             * Invokes the main function with the determined mode in `pack.ts`
             * to execute the pipeline or perform other tasks. This function
             * is awaited to handle any asynchronous operations properly.
             */
            await main(mode);


        } catch (error) {

            /**
             * Handles unexpected errors during execution.
             * Logs the error message to the console and exits with a non-zero
             * error code.
             */
            // Log unexpected errors
            const logger = Logger.getInstance();
            // Narrow the error type before passing to the logger
            if (error instanceof Error) {
                logger.error(CONTEXT, error);
            } else {
                logger.error(CONTEXT, String(error));
            }

            // Exit with an error code to signal failure
            process.exit(1);

        }

    }
)();



/**
 * Note: The `#!/usr/bin/env node` shebang at the top of the file ensures that
 * the script can be executed directly in environments where Node.js is
 * available. It invokes the Node.js runtime to execute this file.
 */
