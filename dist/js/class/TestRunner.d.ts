/**
 * A utility class for running tests from Node.js applications. It simplifies the process of
 * executing shell commands for testing by providing a wrapper around the child_process module.
 */
declare class TestRunner {
    private testCommand;
    /**
     * Constructs a TestRunner with a specific test command.
     * @param {string} testCommand - The command used to run tests (e.g., "npm test").
     */
    constructor(testCommand: string);
    /**
     * Executes the test command in a child process and returns the results.
     * This method captures both stdout and stderr streams, handling any errors by re-throwing them.
     *
     * @returns {Promise<string>} A promise that resolves with the test results as a string if successful.
     * @throws {Error} Throws an error if the test command fails or if stderr captures any error output.
     */
    runTests(): Promise<string>;
}
export default TestRunner;
