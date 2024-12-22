// ============================================================================
// Import
// ============================================================================

import chokidar, { FSWatcher } from "chokidar";


// ============================================================================
// Class
// ============================================================================

/**
 * FileWatcher is a utility class for monitoring file and directory changes.
 * It leverages the `chokidar` library to efficiently detect file changes and
 * trigger appropriate callbacks.
 */
export class FileWatcher {

    // Parameters
    // ========================================================================

    /**
     * The chokidar file watcher instance.
     */
    private watcher: FSWatcher | null = null;


    // Constructor
    // ========================================================================

    /**
     * Creates an instance of FileWatcher.
     * @param pathsToWatch - An array of paths to monitor for changes.
     * @param ignoredPaths - A regular expression to specify paths or patterns
     * to exclude from watching.
     * @param onChange - A callback function that is executed when a file
     * change is detected.
     */
    constructor(
        private pathsToWatch: string[], 
        private ignoredPaths: RegExp, 
        private onChange: (filePath: string) => void
    ) {
        this.startWatching();
    }

    // Methods
    // ========================================================================

    /**
     * Initializes and configures the chokidar watcher to monitor files and
     * directories.
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
     * Starts the file watcher if it is not already running. If the watcher
     * was stopped previously, it re-initializes the watcher.
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
    public async stopWatching() {
        if (this.watcher) {
            await this.watcher.close();
            console.log("File watching has been stopped.");
            this.watcher = null;
        }
    }

    /**
     * Restarts the file watcher by first stopping the existing watcher (if
     * any) and then starting a new one. This can be useful in scenarios where
     * watcher configurations or paths have changed.
     */
    public async restartWatcher() {
        console.log("Restarting file watcher...");
        await this.stopWatching();
        this.startWatching();
    }

}
