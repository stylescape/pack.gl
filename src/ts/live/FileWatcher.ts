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

    // private watcher: FSWatcher;
    private watcher: FSWatcher | null = null;


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
        this.startWatching();

        // this.watcher = chokidar.watch(
        //     this.pathsToWatch,
        //     {
        //         ignored: this.ignoredPaths,
        //         persistent: true,
        //         // Prevents initial "add" events on startup
        //         ignoreInitial: true,
        //         awaitWriteFinish: {
        //             // Waits for file to finish writing
        //             stabilityThreshold: 100,
        //             // Polling interval to check for file stability
        //             pollInterval: 100,
        //         },
        //     }
        // );

        // this.setupWatchers();
    }

    // Methods
    // ========================================================================

    /**
     * Sets up file watchers with chokidar.
     * Logs when the watcher is ready and handles file change events.
     */

    private setupWatchers() {
        if (!this.watcher) return;

        this.watcher
            .on("ready", () => {
                console.log("File watching is active. Waiting for changes...");
            })
            .on("change", (filePath) => {
                console.log(`File changed: ${filePath}`);
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
                console.error("Watcher encountered an error:", error);
            });
    }




    /**
     * Starts the file watcher if it is not already started. Re-initializes
     * if it has been stopped.
     */
    public startWatching() {
        if (this.watcher) {
            console.log("Watcher is already running.");
            return;
        }

        console.log("Starting file watcher...");
        this.watcher = chokidar.watch(this.pathsToWatch, {
            ignored: this.ignoredPaths,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                pollInterval: 100,
                stabilityThreshold: 100,
            },
        });

        this.setupWatchers();
    }

    /**
     * Stops the file watcher and releases resources.
     */
    public async stopWatching() {
        if (this.watcher) {
            await this.watcher.close();
            console.log("File watching has been stopped.");
            this.watcher = null;
        }
    }

    public async restartWatcher() {
        console.log("Restarting file watcher...");
        await this.stopWatching();
        this.startWatching();
    }

}
