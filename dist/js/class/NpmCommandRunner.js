"use strict";
// TypeScript Class to Run NPM Commands
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class NpmCommandRunner {
    /**
     * Executes an npm command.
     * @param command The npm command to run.
     * @returns A promise that resolves with the command output or rejects with an error.
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
exports.default = NpmCommandRunner;
