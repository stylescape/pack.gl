"use strict";
// class/TestRunner.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
var util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
// ============================================================================
// Classes
// ============================================================================
class TestRunner {
    constructor(testCommand) {
        this.testCommand = testCommand;
    }
    /**
     * Runs the tests using the specified test command.
     * @returns A promise that resolves with the test results.
     */
    async runTests() {
        try {
            const { stdout, stderr } = await execAsync(this.testCommand);
            if (stderr) {
                throw new Error(stderr);
            }
            return stdout;
        }
        catch (error) {
            console.error('Error occurred while running tests:', error);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = TestRunner;
// Usage Example
// Here's an example of how you might use the TestRunner class in a project:
// import TestRunner from './TestRunner';
// const runner = new TestRunner('npm test'); // Replace 'npm test' with your actual test command
// runner.runTests()
//     .then(results => {
//         console.log('Test Results:', results);
//     })
//     .catch(error => {
//         console.error('Test Runner Error:', error);
//     });
