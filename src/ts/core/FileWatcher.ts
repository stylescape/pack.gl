// src/live/FileWatcher.ts


// ============================================================================
// Import
// ============================================================================

import chokidar, { FSWatcher } from "chokidar";


// ============================================================================
// Class
// ============================================================================

/**
 * FileWatcher is a utility class for monitoring file and directory changes.
 * It uses `chokidar` to efficiently watch for changes and trigger callbacks.
 */
export class FileWatcher {

    // Parameters
    // ========================================================================

    private watcher: FSWatcher;


    // Constructor
    // ========================================================================

    /**
     * Creates an instance of FileWatcher.
     * @param pathsToWatch - An array of paths to watch for changes.
     * @param ignoredPaths - A regular expression for paths to ignore.
     * @param onChange - A callback function to execute when a file change
     * is detected.
     */
    constructor(
        private pathsToWatch: string[], 
        private ignoredPaths: RegExp, 
        private onChange: (filePath: string) => void
    ) {
        this.watcher = chokidar.watch(
            this.pathsToWatch,
            {
                ignored: this.ignoredPaths,
                persistent: true,
                // Prevents initial "add" events on startup
                ignoreInitial: true,
                awaitWriteFinish: {
                    // Waits for file to finish writing
                    stabilityThreshold: 100,
                    // Polling interval to check for file stability
                    pollInterval: 100,
                },
            }
        );

        this.setupWatchers();
    }

    // Methods
    // ========================================================================

    /**
     * Sets up file watchers with chokidar.
     * Logs when the watcher is ready and handles file change events.
     */
    private setupWatchers() {
        this.watcher
            .on("ready", () => {
                console.log(
                    "File watching is active. Waiting for changes..."
                );
            })
            .on("change", (filePath) => {
                console.log(
                    `File changed: ${filePath}`
                );
                try {
                    this.onChange(filePath);
                } catch (error) {
                    console.error(
                        `Error handling file change for ${filePath}:`,
                        error
                    );
                }
            })
            .on("error", (error) => {
                console.error(
                    "Watcher encountered an error:",
                    error
                );
            });
    }

    /**
     * Starts the file watcher if it is not already started. Re-initializes
     * if it has been stopped.
     */
    public startWatching(): void {
        if (!this.watcher) {
            this.watcher = chokidar.watch(this.pathsToWatch, {
                ignored: this.ignoredPaths,
                persistent: true,
                ignoreInitial: true,
            });
            this.setupWatchers();
            console.log("File watching started.");
        }
    }

    /**
     * Stops the file watcher and releases resources.
     */
    public stopWatching(): void {
        if (this.watcher) {
            this.watcher
                .close()
                .then(() => {
                    console.log(
                        "File watching has been stopped."
                    );
                })
                .catch((error) => {
                    console.error(
                        "Error stopping file watcher:",
                        error
                    );
                });
        }
    }

}
