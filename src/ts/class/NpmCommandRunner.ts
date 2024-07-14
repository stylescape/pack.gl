// class/NpmCommandRunner.ts

// Copyright 2024 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// ============================================================================
// Import
// ============================================================================

import { exec } from 'child_process';


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides a method to execute npm commands programmatically within a Node.js application.
 * This class is particularly useful for automating tasks that involve npm operations,
 * such as installing packages, running scripts, or updating dependencies.
 */
class NpmCommandRunner {

    /**
     * Executes a given npm command and handles its output or errors.
     * 
     * @param command The npm command to be executed, such as 'install', 'update', or a custom script.
     * @returns A promise that resolves with the standard output of the command, or rejects with an error message.
     * 
     * @example
     * // Example usage:
     * const runner = new NpmCommandRunner();
     * runner.runCommand('install express')
     *   .then(output => console.log('NPM Install Output:', output))
     *   .catch(error => console.error('NPM Command Error:', error));
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


// ============================================================================
// Export
// ============================================================================

export default NpmCommandRunner;


// ============================================================================
// Example
// ============================================================================
