// ============================================================================
// Kist Core Tests
// ============================================================================

import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Module mocks
// ----------------------------------------------------------------------------

// The live server, watcher and pipeline manager are collaborators with their
// own suites; here they are replaced so `Kist.run` can be observed in
// isolation without binding ports, watching files or spawning processes.
const mockRunPipeline = jest.fn();
const mockRestartPipeline = jest.fn();
const mockRestartWithDelay = jest.fn();
const mockStopPipeline = jest.fn();
const mockLiveServerShutdown = jest.fn();
const mockWatcherCallback = jest.fn();

jest.mock("../src/ts/core/pipeline/PipelineManager", () => ({
    PipelineManager: class {
        constructor(public liveServer: unknown) {}
        runPipeline = () => mockRunPipeline();
        restartPipeline = () => mockRestartPipeline();
        restartPipelineWithDelay = (delay: number) =>
            mockRestartWithDelay(delay);
        stopPipeline = () => mockStopPipeline();
    },
}));

jest.mock("../src/ts/live/LiveServer", () => ({
    LiveServer: class {
        shutdown = () => mockLiveServerShutdown();
    },
}));

jest.mock("../src/ts/live/LiveWatcher", () => ({
    LiveWatcher: class {
        constructor(onChange: (filePath: string) => void) {
            mockWatcherCallback(onChange);
        }
    },
}));

import { ConfigStore } from "../src/ts/core/config/ConfigStore";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import { Kist } from "../src/ts/kist";

describe("Kist", () => {
    const spies = silenceConsole();
    let root: string;
    let exitSpy: jest.SpyInstance;
    let signalListenersBefore: Record<string, unknown[]>;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-run-"));
        jest.spyOn(process, "cwd").mockReturnValue(root);

        mockRunPipeline.mockReset().mockResolvedValue(undefined);
        mockRestartPipeline.mockReset();
        mockRestartWithDelay.mockReset();
        mockStopPipeline.mockReset();
        mockLiveServerShutdown.mockReset().mockResolvedValue(undefined);
        mockWatcherCallback.mockReset();

        exitSpy = jest
            .spyOn(process, "exit")
            .mockImplementation((() => undefined) as never);

        signalListenersBefore = {
            SIGINT: [...process.listeners("SIGINT")],
            SIGTERM: [...process.listeners("SIGTERM")],
        };

        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        ConfigStore.getInstance().set("options.live", { enabled: false });
    });

    afterEach(() => {
        // Drop only the handlers this test installed.
        for (const signal of ["SIGINT", "SIGTERM"] as const) {
            for (const listener of process.listeners(signal)) {
                if (!signalListenersBefore[signal].includes(listener)) {
                    process.removeListener(signal, listener);
                }
            }
        }
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    /** Enables or disables live reload for the run under test. */
    const setLiveReload = (enabled: boolean): void => {
        ConfigStore.getInstance().set("options.live", { enabled });
    };

    // ------------------------------------------------------------------------
    // Plugin + registry setup
    // ------------------------------------------------------------------------

    describe("initializeActionRegistry", () => {
        it("should note when no external plugins are found", async () => {
            await new Kist().run();

            const output = spyOutput(spies.log());
            expect(output).toContain("Initializing plugin system...");
            expect(output).toContain("No external plugins found.");
            expect(output).toContain(
                "ActionRegistry initialized successfully.",
            );
        });

        it("should list the plugins it discovered", async () => {
            class PluginAction {
                public name = "PluginAction";
                async execute(): Promise<void> {}
            }
            PluginManager.getInstance().registerPlugin(
                {
                    version: "1.4.0",
                    registerActions: () => ({ PluginAction }),
                },
                "demo-plugin",
            );

            await new Kist().run();

            const output = spyOutput(spies.log());
            expect(output).toContain("Loaded 1 plugin(s):");
            expect(output).toContain("- demo-plugin v1.4.0 (1 actions)");
        });

        it("should register the actions the registry needs", async () => {
            await new Kist().run();
            expect(
                ActionRegistry.getInstance().getAction("FileCopyAction"),
            ).toBeDefined();
        });
    });

    // ------------------------------------------------------------------------
    // Pipeline execution
    // ------------------------------------------------------------------------

    describe("run", () => {
        it("should run the pipeline without live reload", async () => {
            setLiveReload(false);

            await new Kist().run();

            expect(mockRunPipeline).toHaveBeenCalledTimes(1);
            expect(mockRestartPipeline).not.toHaveBeenCalled();
            expect(mockWatcherCallback).not.toHaveBeenCalled();
        });

        it("should set up live reload when it is enabled", async () => {
            setLiveReload(true);

            await new Kist().run();

            expect(mockRunPipeline).toHaveBeenCalledTimes(1);
            expect(mockWatcherCallback).toHaveBeenCalledTimes(1);
            expect(mockRestartPipeline).toHaveBeenCalledTimes(1);
            expect(spyOutput(spies.log())).toContain(
                "Enabling live reload functionality...",
            );
        });

        it("should restart the pipeline when a watched file changes", async () => {
            setLiveReload(true);
            await new Kist().run();

            const onChange = mockWatcherCallback.mock.calls[0][0] as (
                filePath: string,
            ) => void;
            onChange("src/index.ts");

            expect(mockRestartWithDelay).toHaveBeenCalledWith(500);
            expect(spyOutput(spies.log())).toContain(
                "Detected change in: src/index.ts. Restarting pipeline...",
            );
        });

        it("should log and exit when the configuration is invalid", async () => {
            ConfigStore.getInstance().set("stages", [
                { name: "bad", steps: [] },
            ]);

            await new Kist().run();

            expect(spyOutput(spies.error())).toContain(
                "must contain at least one step",
            );
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(mockRunPipeline).not.toHaveBeenCalled();

            ConfigStore.getInstance().set("stages", []);
        });

        it("should log and exit when the pipeline fails", async () => {
            mockRunPipeline.mockRejectedValue(new Error("pipeline down"));

            await new Kist().run();

            expect(spyOutput(spies.error())).toContain(
                "An error occurred: pipeline down",
            );
            expect(exitSpy).toHaveBeenCalledWith(1);
        });

        it("should stringify a non-Error failure", async () => {
            mockRunPipeline.mockRejectedValue("just a string");

            await new Kist().run();

            expect(spyOutput(spies.error())).toContain(
                "An error occurred: just a string",
            );
            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });

    // ------------------------------------------------------------------------
    // Shutdown
    // ------------------------------------------------------------------------

    describe("shutdown handling", () => {
        /** Runs Kist with live reload on and fires the given signal. */
        async function runAndSignal(
            signal: "SIGINT" | "SIGTERM",
        ): Promise<void> {
            setLiveReload(true);
            await new Kist().run();
            process.emit(signal);
            // Let the async shutdown handler settle.
            await new Promise((resolve) => setImmediate(resolve));
        }

        it("should shut down cleanly on SIGINT", async () => {
            await runAndSignal("SIGINT");

            expect(mockStopPipeline).toHaveBeenCalledTimes(1);
            expect(mockLiveServerShutdown).toHaveBeenCalledTimes(1);
            expect(spyOutput(spies.log())).toContain(
                "Shutdown completed successfully.",
            );
            expect(exitSpy).toHaveBeenCalledWith(0);
        });

        it("should shut down cleanly on SIGTERM", async () => {
            await runAndSignal("SIGTERM");

            expect(mockStopPipeline).toHaveBeenCalledTimes(1);
            expect(exitSpy).toHaveBeenCalledWith(0);
        });

        it("should log a shutdown failure and still exit", async () => {
            mockLiveServerShutdown.mockRejectedValue(
                new Error("stuck socket"),
            );

            await runAndSignal("SIGINT");

            expect(spyOutput(spies.error())).toContain(
                "Error during shutdown",
            );
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    });
});
