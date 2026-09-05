// ============================================================================
// Import
// ============================================================================

import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";
import micromatch from "micromatch";
import path from "path";
import { AbstractProcess } from "../core/abstract/AbstractProcess.js";
import { globBase, isGlob } from "../core/cache/globExpand.js";
import { ConfigStore } from "../core/config/ConfigStore.js";
import type { LiveOptionsInterface } from "../interface/index.js";
import type { OptionsInterface } from "../interface/OptionsInterface.js";

// ============================================================================
// Class
// ============================================================================

/**
 * LiveWatcher is a utility class for monitoring file and directory changes.
 * It leverages the `chokidar` library to efficiently detect file changes and
 * trigger appropriate callbacks.
 */
export class LiveWatcher extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * The chokidar file watcher instance.
     */
    private watcher: FSWatcher | null = null;

    /**
     * Paths or globs handed to chokidar as the watch roots.
     */
    private pathsToWatch: string[];

    /**
     * Paths or patterns excluded from watching, keeping build output and
     * dependencies from triggering rebuilds of themselves.
     */
    private ignoredPaths: string[];

    /**
     * Called with the changed file's path on every add, change, or unlink.
     */
    private onChange: (filePath: string) => void;

    // Constructor
    // ========================================================================

    /**
     * Creates an instance of LiveWatcher.
     * @param pathsToWatch - An array of paths to monitor for changes.
     * @param ignoredPaths - A regular expression to specify paths or patterns
     * to exclude from watching.
     * @param onChange - A callback function that is executed when a file
     * change is detected.
     */
    constructor(
        // private pathsToWatch: string[],
        // private ignoredPaths: RegExp,
        onChange: (filePath: string) => void,
    ) {
        super();

        // Retrieve live reload configuration from ConfigStore
        const liveReloadOptions: LiveOptionsInterface =
            ConfigStore.getInstance().get<OptionsInterface["live"]>(
                "options.live",
            ) || {};

        this.pathsToWatch = liveReloadOptions.watchPaths ?? [
            "src/**/*",
            "config/**/*",
            "kist.yaml",
            "kist.yml",
        ];
        this.ignoredPaths = liveReloadOptions.ignoredPaths ?? ["node_modules"];

        this.onChange = onChange;

        this.startWatching();
    }

    // Methods
    // ========================================================================

    /**
     * The paths actually handed to chokidar.
     *
     * chokidar dropped glob support in v4, so a pattern like `src/**` names a
     * literal path that does not exist and is silently watched as nothing —
     * which left the default configuration watching no files at all. Each
     * pattern is reduced to the deepest directory it can only ever match
     * inside, and {@link matchesWatchPatterns} narrows the resulting events
     * back down to the pattern.
     *
     * @returns De-duplicated paths for chokidar to watch.
     */
    private watchRoots(): string[] {
        const roots = this.pathsToWatch.map((pattern) => {
            const normalized = pattern.split(path.sep).join("/");
            if (!isGlob(normalized)) return normalized;
            // A pattern whose very first segment is magic (`**/*.ts`) has no
            // static prefix at all and is rooted at the project directory.
            return globBase(normalized) || ".";
        });

        return Array.from(new Set(roots));
    }

    /**
     * Whether a changed path is one the configuration asked to watch.
     *
     * @param filePath - Path reported by chokidar, relative to the cwd.
     * @returns True when the path matches a configured pattern.
     */
    private matchesWatchPatterns(filePath: string): boolean {
        const candidate = filePath.split(path.sep).join("/");

        return this.pathsToWatch.some((pattern) => {
            const normalized = pattern.split(path.sep).join("/");
            if (isGlob(normalized)) {
                return micromatch.isMatch(candidate, normalized);
            }
            // A plain path matches itself, and a plain directory matches
            // everything beneath it.
            return (
                candidate === normalized ||
                candidate.startsWith(`${normalized.replace(/\/$/, "")}/`)
            );
        });
    }

    /**
     * Whether a path is excluded from watching.
     *
     * Bound rather than a plain method so it can be handed to chokidar, which
     * calls it for every entry it considers. Ignore entries are matched as
     * globs, as full paths, and as a plain name at any depth, so the common
     * `node_modules` entry excludes nested copies too.
     *
     * @param targetPath - Path chokidar is considering.
     * @returns True when the path should not be watched.
     */
    private readonly isIgnored = (targetPath: string): boolean => {
        const candidate = path
            .relative(process.cwd(), targetPath)
            .split(path.sep)
            .join("/");

        // Anything outside the project root is not ours to filter.
        if (candidate.startsWith("..")) return false;

        const segments = candidate.split("/");

        return this.ignoredPaths.some((ignored) => {
            const normalized = ignored.split(path.sep).join("/");
            if (isGlob(normalized)) {
                return micromatch.isMatch(candidate, normalized);
            }
            return segments.includes(normalized) || candidate === normalized;
        });
    };

    /**
     * Initializes and configures the chokidar watcher to monitor files and
     * directories.
     */
    private setupWatchers(): void {
        if (!this.watcher) return;

        this.watcher
            .on("ready", () => {
                this.logInfo(
                    "File watching is active. Waiting for changes...",
                );
            })
            .on("change", (filePath) => {
                // chokidar is given directories, so it reports every file
                // beneath them; the configured patterns decide which of those
                // changes actually count.
                if (!this.matchesWatchPatterns(filePath)) {
                    this.logDebug(
                        `Ignoring change outside the watched patterns: ${filePath}`,
                    );
                    return;
                }

                this.logInfo(`File changed: ${filePath}`);
                try {
                    this.onChange(filePath);
                } catch (error) {
                    this.logError(
                        `Error handling file change for ${filePath}:`,
                        error,
                    );
                }
            })
            .on("error", (error) => {
                this.logError("Watcher encountered an error:", error);
            });
    }

    /**
     * Starts the file watcher if it is not already running. If the watcher
     * was stopped previously, it re-initializes the watcher.
     */
    public startWatching(): void {
        if (this.watcher) {
            this.logInfo("Watcher is already running.");
            return;
        }

        this.logInfo("Starting file watcher...");
        this.watcher = chokidar.watch(this.watchRoots(), {
            ignored: this.isIgnored,
            persistent: true,
            // Prevents initial "add" events on startup
            ignoreInitial: true,
            awaitWriteFinish: {
                // Polling interval to check for file stability
                pollInterval: 100,
                // Waits for file to finish writing
                stabilityThreshold: 100,
            },
        });

        this.setupWatchers();
    }

    /**
     * Stops the file watcher and releases its resources. This is useful when
     * you need to clean up or reinitialize the watcher.
     */
    public async stopWatching(): Promise<void> {
        if (this.watcher) {
            await this.watcher.close();
            this.logInfo("File watching has been stopped.");
            this.watcher = null;
        }
    }

    /**
     * Restarts the file watcher by first stopping the existing watcher (if
     * any) and then starting a new one. This can be useful in scenarios where
     * watcher configurations or paths have changed.
     */
    public async restartWatcher(): Promise<void> {
        this.logInfo("Restarting file watcher...");
        await this.stopWatching();
        this.startWatching();
    }
}
