// ============================================================================
// Imports
// ============================================================================

import { execFile } from "child_process";
import path from "path";
import util from "util";
import { Action } from "../../core/pipeline/Action.js";
import type { ActionOptionsType } from "../../types/ActionOptionsType.js";

// ============================================================================
// Constants
// ============================================================================

const execFileAsync = util.promisify(execFile);

// ============================================================================
// Classes
// ============================================================================

/**
 * RunScriptAction executes an external JavaScript file as part of a KIST pipeline.
 * The script is executed in a separate process to avoid blocking the main application.
 */
export class RunScriptAction extends Action {
    /**
     * Executes the external script file.
     *
     * @param options - The options specifying the script file to execute.
     * @returns A Promise that resolves when the script execution completes.
     * @throws {Error} If the script execution fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { scriptPath, args = [] } = options;

        if (!scriptPath) {
            throw new Error("Invalid options: 'scriptPath' is required.");
        }

        const resolvedScriptPath = path.resolve(scriptPath);

        this.logInfo(`Executing external script: ${resolvedScriptPath}...`);

        try {
            // `process.execPath` rather than "node": the script must run on
            // the same runtime as the pipeline, which a bare "node" from PATH
            // is not guaranteed to be — and need not exist at all when kist
            // runs under a version manager or a bundled runtime.
            const { stdout, stderr } = await execFileAsync(
                process.execPath,
                [resolvedScriptPath, ...args],
                // Scripts that print a lot would otherwise fail with ENOBUFS
                // once they crossed the 1MB default.
                { maxBuffer: 64 * 1024 * 1024 },
            );

            // Output on stderr is not failure: warnings, progress and Node's
            // own deprecation notices all go there. The exit status says
            // whether the script succeeded, and a non-zero one has already
            // rejected by this point.
            if (stderr) {
                this.logWarn(stderr.trimEnd());
            }
            if (stdout) {
                this.logInfo(stdout.trimEnd());
            }
            this.logInfo("Script executed successfully.");
        } catch (error) {
            this.logError("Error occurred while executing the script.", error);
            throw error;
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Executes an external JavaScript file as part of the KIST pipeline.";
    }
}
