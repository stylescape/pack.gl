"use strict";
// class/NpmCommandRunner.ts
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2023 Scape Agency BV
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
var child_process_1 = require("child_process");
// ============================================================================
// Classes
// ============================================================================
/// TypeScript Class to Run NPM Commands
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
// ============================================================================
// Export
// ============================================================================
exports.default = NpmCommandRunner;
