// class/TestRunner.ts


// ============================================================================
// Import
// ============================================================================

import { exec } from "child_process";
import util from "util";

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
     * @param {string} testCommand - The command used to run tests (e.g., "npm test").
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
            console.error("Error occurred while running tests:", error);
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

// import TestRunner from "./TestRunner";

// const runner = new TestRunner("npm test"); // Replace "npm test" with your actual test command
// runner.runTests()
//     .then(results => {
//         console.log("Test Results:", results);
//     })
//     .catch(error => {
//         console.error("Test Runner Error:", error);
//     });