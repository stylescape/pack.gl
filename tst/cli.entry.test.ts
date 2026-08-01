// ============================================================================
// CLI Entry Point Tests
// ============================================================================

// `cli.ts` is a top-level async IIFE, so it runs the moment the module is
// required. Every collaborator is mocked and the module is required inside
// `jest.isolateModules` so each test gets a fresh execution.
//
// The Logger is mocked rather than spied on: because the CLI is required in an
// isolated registry, a spy on the singleton imported here would not be the
// instance the CLI actually touches.
const mockSetLogLevel = jest.fn();

jest.mock("../src/ts/logger/Logger", () => ({
    Logger: { getInstance: () => ({ setLogLevel: mockSetLogLevel }) },
}));

const mockGetAllFlags = jest.fn();
const mockInitialize = jest.fn();
const mockLoadConfig = jest.fn();
const mockMerge = jest.fn();
const mockGet = jest.fn();
const mockRun = jest.fn();

jest.mock("../src/ts/cli/ArgumentParser", () => ({
    ArgumentParser: class {
        getAllFlags = () => mockGetAllFlags();
    },
}));

jest.mock("../src/ts/core/config/ConfigLoader", () => ({
    ConfigLoader: class {
        initialize = () => mockInitialize();
        loadConfig = () => mockLoadConfig();
    },
}));

jest.mock("../src/ts/core/config/ConfigStore", () => ({
    ConfigStore: {
        getInstance: () => ({ merge: mockMerge, get: mockGet }),
    },
}));

jest.mock("../src/ts/kist", () => ({
    Kist: class {
        run = () => mockRun();
    },
}));

/** Requires `cli.ts` afresh and waits for its IIFE to settle. */
async function runCli(): Promise<void> {
    jest.isolateModules(() => {
        require("../src/ts/cli");
    });
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
}

describe("cli entry point", () => {
    let errorSpy: jest.SpyInstance;
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
        mockGetAllFlags.mockReset().mockReturnValue({ mode: "development" });
        mockInitialize.mockReset().mockResolvedValue(undefined);
        mockLoadConfig.mockReset().mockResolvedValue({ stages: [] });
        mockMerge.mockReset();
        mockGet.mockReset().mockReturnValue(undefined);
        mockSetLogLevel.mockReset();
        mockRun.mockReset().mockResolvedValue(undefined);

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

    it("should load the configuration and run the workflow", async () => {
        await runCli();

        expect(mockInitialize).toHaveBeenCalledTimes(1);
        expect(mockLoadConfig).toHaveBeenCalledTimes(1);
        expect(mockRun).toHaveBeenCalledTimes(1);
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it("should leave the log level alone by default", async () => {
        await runCli();
        expect(mockSetLogLevel).not.toHaveBeenCalled();
    });

    it("should expand a bare --live flag into the live options block", async () => {
        mockGetAllFlags.mockReturnValue({ live: true });

        await runCli();

        expect(mockMerge).toHaveBeenNthCalledWith(2, {
            options: { live: { enabled: true } },
        });
    });

    it("should force debug logging for --verbose", async () => {
        mockGetAllFlags.mockReturnValue({ verbose: true });

        await runCli();

        expect(mockSetLogLevel).toHaveBeenCalledWith("debug");
    });

    it("should apply the configured log level", async () => {
        mockGet.mockReturnValue("warn");

        await runCli();

        expect(mockGet).toHaveBeenCalledWith("options.logLevel");
        expect(mockSetLogLevel).toHaveBeenCalledWith("warn");
    });

    it("should merge the file configuration before the CLI options", async () => {
        await runCli();

        expect(mockMerge).toHaveBeenNthCalledWith(1, { stages: [] });
        expect(mockMerge).toHaveBeenNthCalledWith(2, {
            options: { mode: "development" },
        });
    });

    it("should report and exit when configuration loading fails", async () => {
        mockLoadConfig.mockRejectedValue(new Error("bad config"));

        await runCli();

        expect(errorSpy).toHaveBeenCalledWith(
            "[CLI] An unexpected error occurred:",
            expect.any(Error),
        );
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(mockRun).not.toHaveBeenCalled();
    });

    it("should report and exit when the workflow fails", async () => {
        mockRun.mockRejectedValue(new Error("workflow down"));

        await runCli();

        expect(errorSpy).toHaveBeenCalledWith(
            "[CLI] An unexpected error occurred:",
            expect.any(Error),
        );
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});

// ----------------------------------------------------------------------------
// Log level selection
// ----------------------------------------------------------------------------

describe("cli log level", () => {
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
        mockGetAllFlags.mockReset().mockReturnValue({});
        mockInitialize.mockReset().mockResolvedValue(undefined);
        mockLoadConfig.mockReset().mockResolvedValue({ stages: [] });
        mockMerge.mockReset();
        mockGet.mockReset().mockReturnValue(undefined);
        mockSetLogLevel.mockReset();
        mockRun.mockReset().mockResolvedValue(undefined);

        jest.spyOn(console, "error").mockImplementation(() => undefined);
        exitSpy = jest
            .spyOn(process, "exit")
            .mockImplementation((() => undefined) as never);
        mockSetLogLevel.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should force debug logging when --verbose is passed", async () => {
        mockGetAllFlags.mockReturnValue({ verbose: true });
        mockGet.mockReturnValue("warn");

        await runCli();

        expect(mockSetLogLevel).toHaveBeenCalledWith("debug");
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it("should apply the configured log level when --verbose is absent", async () => {
        mockGet.mockReturnValue("warn");

        await runCli();

        expect(mockSetLogLevel).toHaveBeenCalledWith("warn");
    });

    it("should leave the log level alone when neither is set", async () => {
        await runCli();
        expect(mockSetLogLevel).not.toHaveBeenCalled();
    });

    it("should ignore a non-true verbose flag", async () => {
        mockGetAllFlags.mockReturnValue({ verbose: "yes" });
        mockGet.mockReturnValue("error");

        await runCli();

        expect(mockSetLogLevel).toHaveBeenCalledWith("error");
    });
});
