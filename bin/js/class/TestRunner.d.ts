declare class TestRunner {
    private testCommand;
    constructor(testCommand: string);
    runTests(): Promise<string>;
}
export default TestRunner;
