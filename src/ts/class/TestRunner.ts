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

class TestRunner {
    private testCommand: string;

    constructor(testCommand: string) {
        this.testCommand = testCommand;
    }

    /**
     * Runs the tests using the specified test command.
     * @returns A promise that resolves with the test results.
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
