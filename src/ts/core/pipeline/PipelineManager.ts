// ============================================================================
// Import
// ============================================================================

import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import type { LiveServer } from "../../live/LiveServer.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { ConfigStore } from "../config/ConfigStore.js";
import { Pipeline } from "./Pipeline.js";

// ============================================================================
// Class
// ============================================================================

/**
 * Manages the lifecycle of the pipeline process and integrates with the
 * LiveServer for client notifications upon pipeline events.
 */
export class PipelineManager extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Environment variable set on rebuild child processes.
     *
     * A rebuild re-runs the original CLI invocation, which in live mode still
     * carries `--live` — and live mode may equally be switched on by the
     * configuration file, where no argument can remove it. Without a marker
     * the child starts its own server and watcher, fails to bind the port the
     * parent already holds, and spawns a rebuild child of its own.
     */
    public static readonly REBUILD_ENV = "KIST_REBUILD_CHILD";

    /**
     * The current instance of the pipeline process.
     */
    private pipelineProcess: ChildProcess | null = null;

    /**
     * Flag to prevent overlapping restarts.
     */
    private isRestarting: boolean = false;

    // Constructor
    // ========================================================================

    /**
     * Initializes the PipelineManager with a LiveServer instance.
     *
     * @param liveServer - The LiveServer instance to notify when the
     * pipeline restarts.
     */
    constructor(private liveServer?: LiveServer) {
        super();
        this.logInfo("PipelineManager initialized.");
    }

    // Static Methods
    // ========================================================================

    /**
     * Whether this process is a rebuild spawned by a live-mode parent.
     *
     * Such a process runs the pipeline once and exits; it must not start a
     * live server or a watcher of its own.
     *
     * @returns True when running as a rebuild child.
     */
    public static isRebuildChild(): boolean {
        return process.env[PipelineManager.REBUILD_ENV] === "1";
    }

    // Methods
    // ========================================================================

    /**
     * Runs the pipeline using the configuration from the `ConfigStore`.
     * This method executes the pipeline stages directly, bypassing the CLI.
     */
    public async runPipeline(): Promise<void> {
        const config = ConfigStore.getInstance().getConfig();

        if (!config.stages || !Array.isArray(config.stages)) {
            throw new Error(
                "Invalid configuration: 'stages' must be an array.",
            );
        }

        this.logInfo("Initializing pipeline...");
        const pipeline = new Pipeline(config);

        try {
            await pipeline.run();

            this.logInfo("Pipeline execution finished successfully.");
            this.liveServer?.reloadClients();
        } catch (error) {
            this.logError("Error during pipeline execution.", error);
            throw error;
        }
    }

    /**
     * Restarts the pipeline process, stopping any currently running process.
     * Notifies connected clients via the LiveServer after restarting.
     */
    public restartPipeline(): void {
        if (this.isRestarting) {
            this.logWarn("Pipeline restart already in progress. Skipping...");
            return;
        }

        this.isRestarting = true;

        if (this.pipelineProcess) {
            this.logInfo("Stopping current pipeline process...");
            this.stopPipeline();
        }

        this.logInfo("Starting pipeline...");

        // Re-run the original CLI invocation (script + arguments) rather
        // than a path hardcoded relative to the consumer's project, which
        // only existed when kist built itself. `--live` is dropped and the
        // rebuild marker set so the child performs a single build instead of
        // becoming a second live server.
        this.pipelineProcess = spawn(
            process.execPath,
            PipelineManager.rebuildArgs(process.argv.slice(1)),
            {
                stdio: "inherit",
                env: {
                    ...process.env,
                    [PipelineManager.REBUILD_ENV]: "1",
                },
            },
        );

        this.attachProcessListeners();

        this.isRestarting = false;
    }

    /**
     * Strips live-mode flags from a CLI invocation so the rebuild child runs
     * the pipeline once and exits.
     *
     * @param args - The original arguments, without the node executable.
     * @returns The arguments to give the rebuild child.
     */
    private static rebuildArgs(args: string[]): string[] {
        return args.filter(
            (argument) => argument !== "--live" && argument !== "--live=true",
        );
    }

    /**
     * Attaches event listeners to the pipeline process for logging and
     * notification purposes.
     */
    private attachProcessListeners(): void {
        if (!this.pipelineProcess) return;

        this.pipelineProcess.on("close", (code) => {
            if (code !== 0) {
                this.logError(`Pipeline process exited with code ${code}`);
            } else {
                this.logInfo("Pipeline process exited successfully.");
            }
            this.liveServer?.reloadClients();
        });

        this.pipelineProcess.on("error", (error) => {
            this.logError("Error starting pipeline process.", error);
        });

        this.pipelineProcess.on("exit", (code, signal) => {
            if (signal) {
                this.logWarn(
                    `Pipeline process was terminated with signal: ${signal}`,
                );
            } else {
                this.logInfo(`Pipeline process exited with code: ${code}`);
            }
        });
    }

    /**
     * Stops the currently running pipeline process, if any.
     * Gracefully kills the process and handles cleanup.
     */
    public stopPipeline(): void {
        if (this.pipelineProcess) {
            this.logInfo("Stopping pipeline process...");
            this.pipelineProcess.kill("SIGTERM");
            this.pipelineProcess = null;
            this.logInfo("Pipeline process stopped.");
        } else {
            this.logWarn("No pipeline process is currently running.");
        }
    }

    /**
     * Checks if the pipeline process is currently running.
     * @returns True if the pipeline process is running, false otherwise.
     */
    public isPipelineRunning(): boolean {
        return this.pipelineProcess !== null && !this.pipelineProcess.killed;
    }

    /**
     * Restarts the pipeline with a delay, useful for throttling restarts when
     * changes occur rapidly.
     * @param delay - The delay in milliseconds before restarting the pipeline.
     */
    public restartPipelineWithDelay(delay: number = 1000): void {
        this.logInfo(`Delaying pipeline restart by ${delay} milliseconds...`);
        setTimeout(() => this.restartPipeline(), delay);
    }
}
