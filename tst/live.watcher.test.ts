// ============================================================================
// LiveWatcher Tests
// ============================================================================

import { EventEmitter } from "events";
import { resolve } from "path";
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
            // chokidar has no glob support, so it is handed the directory the
            // pattern is rooted in; the pattern itself filters the events.
            expect(mockWatch).toHaveBeenCalledWith(["lib"], {
                ignored: expect.any(Function),
                persistent: true,
                ignoreInitial: true,
                awaitWriteFinish: {
                    pollInterval: 100,
                    stabilityThreshold: 100,
                },
            });
        });

        it("should reduce each watch pattern to a real directory", () => {
            build({
                watchPaths: [
                    "src/**/*.ts",
                    "config/**/*",
                    "kist.yml",
                    "**/*.md",
                ],
            });

            // A pattern with no static prefix is rooted at the project.
            expect(mockWatch.mock.calls[0][0]).toEqual([
                "src",
                "config",
                "kist.yml",
                ".",
            ]);
        });

        it("should collapse patterns that share a directory", () => {
            build({ watchPaths: ["src/**/*.ts", "src/**/*.css"] });
            expect(mockWatch.mock.calls[0][0]).toEqual(["src"]);
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

        it("should ignore a change that no watch pattern covers", () => {
            build({ watchPaths: ["src/**/*.ts"] });
            fsWatcher.emit("change", "src/styles.css");

            expect(onChange).not.toHaveBeenCalled();
        });

        it("should report a change matching a glob pattern", () => {
            build({ watchPaths: ["src/**/*.ts"] });
            fsWatcher.emit("change", "src/deep/nested/index.ts");

            expect(onChange).toHaveBeenCalledWith("src/deep/nested/index.ts");
        });

        it("should report a change under a plain directory", () => {
            build({ watchPaths: ["assets"] });
            fsWatcher.emit("change", "assets/img/logo.svg");

            expect(onChange).toHaveBeenCalledWith("assets/img/logo.svg");
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
    // Ignore rules
    // ------------------------------------------------------------------------

    describe("ignored paths", () => {
        /** The predicate handed to chokidar for the given ignore list. */
        function ignorer(ignoredPaths: string[]): (path: string) => boolean {
            build({ ignoredPaths });
            return mockWatch.mock.calls[0][1].ignored as (
                path: string,
            ) => boolean;
        }

        it("should exclude a named directory at any depth", () => {
            // chokidar matches a bare string as an exact path, so a nested
            // install would otherwise be watched.
            const ignored = ignorer(["node_modules"]);

            expect(ignored(resolve("node_modules"))).toBe(true);
            expect(
                ignored(resolve("packages/app/node_modules/pkg/i.js")),
            ).toBe(true);
            expect(ignored(resolve("src/index.ts"))).toBe(false);
        });

        it("should apply glob ignore patterns", () => {
            const ignored = ignorer(["**/*.log"]);

            expect(ignored(resolve("logs/build.log"))).toBe(true);
            expect(ignored(resolve("logs/build.txt"))).toBe(false);
        });

        it("should not filter paths outside the project root", () => {
            const ignored = ignorer(["node_modules"]);
            expect(ignored("/somewhere/else/entirely.ts")).toBe(false);
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
