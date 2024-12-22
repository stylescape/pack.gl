#!/usr/bin/env node

/**
 * The entry point for the Pack CLI application.
 * This script sets up the runtime environment, invokes the `main` function
 * from `pack.ts`, and handles any unexpected errors during execution.
 */


// ============================================================================
// Import
// ============================================================================

import { main } from "./pack";


// ============================================================================
// Main
// ============================================================================

(
    async () => {

        try {

            /**
             * Calls the main function defined in `pack.ts` to execute the
             * pipeline or perform other tasks. This function is awaited to
             * handle any asynchronous operations properly.
             */
            await main();

        } catch (error) {

            /**
             * Handles unexpected errors during execution.
             * Logs the error message to the console and exits with a non-zero
             * error code.
             */
            console.error(
                "An unexpected error occurred:",
                error instanceof Error ? error.message : error
            );

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
