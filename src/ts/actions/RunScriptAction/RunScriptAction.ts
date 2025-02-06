// ============================================================================
// Imports
// ============================================================================

import { execFile } from "child_process";
import path from "path";
import util from "util";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

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
            const { stdout, stderr } = await execFileAsync("node", [
                resolvedScriptPath,
                ...args,
            ]);

            if (stderr) {
                this.logError(`Script execution failed: ${stderr}`);
                throw new Error(stderr);
            }

            this.logInfo(stdout);
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
