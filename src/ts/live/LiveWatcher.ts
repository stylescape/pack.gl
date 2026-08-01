// ============================================================================
// Import
// ============================================================================

import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";
import { AbstractProcess } from "../core/abstract/AbstractProcess.js";
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

    private pathsToWatch: string[];
    private ignoredPaths: string[];
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
        this.watcher = chokidar.watch(this.pathsToWatch, {
            ignored: this.ignoredPaths,
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
