// TypeScript Class to Run NPM Commands

import { exec } from 'child_process';

class NpmCommandRunner {
    /**
     * Executes an npm command.
     * @param command The npm command to run.
     * @returns A promise that resolves with the command output or rejects with an error.
     */
    runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(`npm ${command}`, (error, stdout, stderr) => {
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

export default NpmCommandRunner;
