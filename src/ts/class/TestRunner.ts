// class/TestRunner.ts

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
import util from 'util';

const execAsync = util.promisify(exec);


// ============================================================================
// Classes
// ============================================================================

/**
 * A utility class for running tests from Node.js applications. It simplifies the process of
 * executing shell commands for testing by providing a wrapper around the child_process module.
 */
class TestRunner {

    private testCommand: string;

    /**
     * Constructs a TestRunner with a specific test command.
     * @param {string} testCommand - The command used to run tests (e.g., 'npm test').
     */
    constructor(testCommand: string) {
        this.testCommand = testCommand;
    }

    /**
     * Executes the test command in a child process and returns the results.
     * This method captures both stdout and stderr streams, handling any errors by re-throwing them.
     *
     * @returns {Promise<string>} A promise that resolves with the test results as a string if successful.
     * @throws {Error} Throws an error if the test command fails or if stderr captures any error output.
     */
    async runTests(): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(this.testCommand);
            
            if (stderr) {
                throw new Error(stderr);
            }

            return stdout;
        } catch (error) {
            console.error('Error occurred while running tests:', error);
            throw error;
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default TestRunner;


// ============================================================================
// Example
// ============================================================================

// import TestRunner from './TestRunner';

// const runner = new TestRunner('npm test'); // Replace 'npm test' with your actual test command
// runner.runTests()
//     .then(results => {
//         console.log('Test Results:', results);
//     })
//     .catch(error => {
//         console.error('Test Runner Error:', error);
//     });