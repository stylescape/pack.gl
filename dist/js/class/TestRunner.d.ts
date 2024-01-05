declare class TestRunner {
    private testCommand;
    constructor(testCommand: string);
    /**
     * Runs the tests using the specified test command.
     * @returns A promise that resolves with the test results.
     */
    runTests(): Promise<string>;
}
export default TestRunner;
