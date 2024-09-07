"use strict";
// class/NpmCommandRunner.ts
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================================
// Import
// ============================================================================
const child_process_1 = require("child_process");
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides a method to execute npm commands programmatically within a Node.js
 * application. This class is particularly useful for automating tasks that
 * involve npm operations, such as installing packages, running scripts, or
 * updating dependencies.
 */
class NpmCommandRunner {
    /**
     * Executes a given npm command and handles its output or errors.
     *
     * @param command The npm command to be executed, such as "install", "update", or a custom script.
     * @returns A promise that resolves with the standard output of the command, or rejects with an error message.
     *
     * @example
     * // Example usage:
     * const runner = new NpmCommandRunner();
     * runner.runCommand("install express")
     *   .then(output => console.log("NPM Install Output:", output))
     *   .catch(error => console.error("NPM Command Error:", error));
     */
    runCommand(command) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`npm ${command}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`stderr: ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = NpmCommandRunner;
// ============================================================================
// Example
// ============================================================================
