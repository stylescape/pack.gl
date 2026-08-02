#!/usr/bin/env node

// ============================================================================
// Imports
// ============================================================================

import { CommanderError } from "commander";
import { runCli } from "./cli/Program.js";
import { KistError } from "./errors/index.js";

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * The entry point for the kist CLI. Delegates argument parsing and dispatch to
 * the commander program and turns whatever comes back into an exit code.
 */
(async (): Promise<void> => {
    try {
        await runCli(process.argv);
    } catch (error) {
        // `--help` and `--version` reach here as CommanderError with an exit
        // code of 0; they are a successful outcome, not a failure.
        if (error instanceof CommanderError) {
            return process.exit(error.exitCode);
        }

        // A KistError already carries a message written for the person
        // running the command, so print it without a stack trace. Anything
        // else is unexpected and the stack is the useful part.
        // eslint-disable-next-line no-console
        console.error(
            error instanceof KistError
                ? `kist: ${error.message}`
                : `kist: unexpected error:`,
        );
        if (!(error instanceof KistError)) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
        process.exit(1);
    }
})();

/**
 * Note: The `#!/usr/bin/env node` shebang ensures that the script can be
 * executed directly as a Node.js script on compatible systems.
 */
