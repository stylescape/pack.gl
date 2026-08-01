// ============================================================================
// LiveWatcher Tests
// ============================================================================

import { EventEmitter } from "events";
import { silenceConsole, spyOutput } from "./helpers/silence";

// chokidar is replaced so the watcher never touches the filesystem; the
// returned emitter stands in for an FSWatcher.
const mockWatch = jest.fn();

jest.mock("chokidar", () => ({
    __esModule: true,
    default: { watch: (...args: unknown[]) => mockWatch(...args) },
}));

import { ConfigStore } from "../src/ts/core/config/ConfigStore";
import { LiveWatcher } from "../src/ts/live/LiveWatcher";

/** A stand-in for chokidar's FSWatcher. */
class FakeWatcher extends EventEmitter {
    public close = jest.fn(async () => undefined);
}

/** Internal shape of LiveWatcher used for white-box assertions. */
interface LiveWatcherInternals {
    watcher: FakeWatcher | null;
    pathsToWatch: string[];
    ignoredPaths: string[];
}

const internals = (watcher: LiveWatcher): LiveWatcherInternals =>
    watcher as unknown as LiveWatcherInternals;

describe("LiveWatcher", () => {
    const spies = silenceConsole();
    let fsWatcher: FakeWatcher;
    let onChange: jest.Mock;

    beforeEach(() => {
        fsWatcher = new FakeWatcher();
        mockWatch.mockReset();
        mockWatch.mockImplementation(() => fsWatcher);
        onChange = jest.fn();
        ConfigStore.getInstance().set("options.live", {});
    });

    /** Applies a live configuration and constructs a watcher. */
    function build(live: Record<string, unknown> | undefined): LiveWatcher {
        ConfigStore.getInstance().set("options.live", live);
        return new LiveWatcher(onChange as (filePath: string) => void);
    }

    // ------------------------------------------------------------------------
    // Construction
    // ------------------------------------------------------------------------

    describe("construction", () => {
        it("should use the configured watch and ignore paths", () => {
            const watcher = build({
                watchPaths: ["lib/**/*"],
                ignoredPaths: ["tmp"],
            });

            expect(internals(watcher).pathsToWatch).toEqual(["lib/**/*"]);
            expect(internals(watcher).ignoredPaths).toEqual(["tmp"]);
            expect(mockWatch).toHaveBeenCalledWith(["lib/**/*"], {
                ignored: ["tmp"],
                persistent: true,
                ignoreInitial: true,
                awaitWriteFinish: {
                    pollInterval: 100,
                    stabilityThreshold: 100,
                },
            });
        });

        it("should fall back to defaults for an empty live block", () => {
            const watcher = build({});

            expect(internals(watcher).pathsToWatch).toEqual([
                "src/**/*",
                "config/**/*",
                "kist.yaml",
                "kist.yml",
            ]);
            expect(internals(watcher).ignoredPaths).toEqual(["node_modules"]);
        });

        it("should fall back to defaults when live options are absent", () => {
            const watcher = build(undefined);
            expect(internals(watcher).ignoredPaths).toEqual(["node_modules"]);
        });

        it("should start watching immediately", () => {
            build({});
            expect(mockWatch).toHaveBeenCalledTimes(1);
            expect(spyOutput(spies.log())).toContain(
                "Starting file watcher...",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Watcher events
    // ------------------------------------------------------------------------

    describe("watcher events", () => {
        it("should announce readiness", () => {
            build({});
            fsWatcher.emit("ready");
            expect(spyOutput(spies.log())).toContain(
                "File watching is active. Waiting for changes...",
            );
        });

        it("should invoke the callback on change", () => {
            build({});
            fsWatcher.emit("change", "src/index.ts");

            expect(onChange).toHaveBeenCalledWith("src/index.ts");
            expect(spyOutput(spies.log())).toContain(
                "File changed: src/index.ts",
            );
        });

        it("should log an error thrown by the change callback", () => {
            onChange.mockImplementation(() => {
                throw new Error("handler blew up");
            });
            build({});

            expect(() =>
                fsWatcher.emit("change", "src/index.ts"),
            ).not.toThrow();
            expect(spyOutput(spies.error())).toContain(
                "Error handling file change for src/index.ts",
            );
        });

        it("should log watcher errors", () => {
            build({});
            fsWatcher.emit("error", new Error("EMFILE"));
            expect(spyOutput(spies.error())).toContain(
                "Watcher encountered an error:",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------------

    describe("startWatching", () => {
        it("should be a no-op while a watcher is already running", () => {
            const watcher = build({});
            watcher.startWatching();

            expect(mockWatch).toHaveBeenCalledTimes(1);
            expect(spyOutput(spies.log())).toContain(
                "Watcher is already running.",
            );
        });

        it("should do nothing in setupWatchers without a watcher", () => {
            const watcher = build({});
            internals(watcher).watcher = null;
            const asInternal = watcher as unknown as {
                setupWatchers: () => void;
            };
            expect(() => asInternal.setupWatchers()).not.toThrow();
        });
    });

    describe("stopWatching", () => {
        it("should close and clear the watcher", async () => {
            const watcher = build({});

            await watcher.stopWatching();

            expect(fsWatcher.close).toHaveBeenCalled();
            expect(internals(watcher).watcher).toBeNull();
            expect(spyOutput(spies.log())).toContain(
                "File watching has been stopped.",
            );
        });

        it("should be a no-op when nothing is running", async () => {
            const watcher = build({});
            await watcher.stopWatching();
            fsWatcher.close.mockClear();

            await watcher.stopWatching();

            expect(fsWatcher.close).not.toHaveBeenCalled();
        });
    });

    describe("restartWatcher", () => {
        it("should stop and start again", async () => {
            const watcher = build({});

            await watcher.restartWatcher();

            expect(fsWatcher.close).toHaveBeenCalledTimes(1);
            expect(mockWatch).toHaveBeenCalledTimes(2);
            expect(spyOutput(spies.log())).toContain(
                "Restarting file watcher...",
            );
        });
    });
});
