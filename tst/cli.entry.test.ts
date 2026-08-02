// ============================================================================
// CLI Entry Point Tests
// ============================================================================

// `cli.ts` is a top-level async IIFE, so it runs the moment the module is
// required. The program it delegates to is mocked and the module is required
// inside `jest.isolateModules` so each test gets a fresh execution.
const mockRunCli = jest.fn();

jest.mock("../src/ts/cli/Program", () => ({
    runCli: (...args: unknown[]) => mockRunCli(...args),
}));

/**
 * Requires `cli.ts` afresh and waits for its IIFE to settle. The registry is
 * reset in `beforeEach` rather than here so that error classes required by a
 * test come from the same registry as the entry point — `instanceof` compares
 * class identity, and two registries hold two distinct classes.
 */
async function runEntry(): Promise<void> {
    require("../src/ts/cli");
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
}

/** The error classes as seen by the freshly-required entry point. */
function errorClasses(): {
    CommanderError: typeof import("commander").CommanderError;
    KistError: typeof import("../src/ts/errors/index").KistError;
} {
    return {
        CommanderError: require("commander").CommanderError,
        KistError: require("../src/ts/errors/index").KistError,
    };
}

describe("cli entry point", () => {
    let errorSpy: jest.SpyInstance;
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.resetModules();
        mockRunCli.mockReset().mockResolvedValue(undefined);
        errorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        exitSpy = jest
            .spyOn(process, "exit")
            .mockImplementation((() => undefined) as never);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should hand process.argv to the program", async () => {
        await runEntry();

        expect(mockRunCli).toHaveBeenCalledTimes(1);
        expect(mockRunCli).toHaveBeenCalledWith(process.argv);
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it("should exit with commander's own code for --help and --version", async () => {
        // Commander signals a successful `--help` by throwing with code 0
        // once `exitOverride` is in play; the entry point must not turn that
        // into a failure.
        const { CommanderError } = errorClasses();
        mockRunCli.mockRejectedValue(
            new CommanderError(0, "commander.helpDisplayed", "(outputHelp)"),
        );

        await runEntry();

        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("should print a KistError without a stack trace", async () => {
        const { KistError } = errorClasses();
        mockRunCli.mockRejectedValue(new KistError("bad config", "CONFIG"));

        await runEntry();

        expect(errorSpy).toHaveBeenCalledWith("kist: bad config");
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should print the whole error for anything unexpected", async () => {
        const failure = new Error("something else");
        mockRunCli.mockRejectedValue(failure);

        await runEntry();

        expect(errorSpy).toHaveBeenCalledWith("kist: unexpected error:");
        expect(errorSpy).toHaveBeenCalledWith(failure);
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});
