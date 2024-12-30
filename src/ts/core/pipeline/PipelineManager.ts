// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../abstract/AbstractProcess";
import { spawn, ChildProcess } from "child_process";
import { LiveServer } from "../../live/LiveServer";
import path from "path";


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

    private pipelineProcess: ChildProcess | null = null;


    // Constructor
    // ========================================================================

    /**
     * Initializes the PipelineManager with a LiveServer instance.
     * @param liveServer - The LiveServer instance to notify when the
     * pipeline restarts.
     */
    constructor(
        private liveServer: LiveServer
    ) {
        super();
        this.logInfo("PipelineManager initialized.");
    }


    // Methods
    // ========================================================================

    /**
     * Restarts the pipeline process, stopping any currently running process.
     * Notifies connected clients via the LiveServer after restarting.
     */
    public restartPipeline(): void {
        if (this.pipelineProcess) {
            this.logInfo("Stopping current pipeline process...");
            this.stopPipeline();
        }

        this.logInfo("Starting pipeline...");

        const scriptPath = path.resolve(process.cwd(), "dist/js/cli.js");

        this.pipelineProcess = spawn("node", [scriptPath], { stdio: "inherit" });

        this.attachProcessListeners();
    }

    /**
     * Attaches event listeners to the pipeline process for logging and
     * notification purposes.
     */
    private attachProcessListeners(): void {
        if (!this.pipelineProcess) return;

        this.pipelineProcess.on("close", (code) => {
            if (code !== 0) {
                this.logError(
                    `Pipeline process exited with code ${code}`
                );
            } else {
                this.logInfo(
                    "Pipeline process exited successfully."
                );
            }
            this.liveServer.reloadClients();
        });

        this.pipelineProcess.on("error", (error) => {
            this.logError(
                "Error starting pipeline process.",
                error
            );
        });

        this.pipelineProcess.on("exit", (code, signal) => {
            if (signal) {
                this.logWarn(
                    `Pipeline process was terminated with signal: ${signal}`
                );
            } else {
                this.logInfo(
                    `Pipeline process exited with code: ${code}`
                );
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
        this.logInfo(
            `Delaying pipeline restart by ${delay} milliseconds...`
        );
        setTimeout(() => this.restartPipeline(), delay);
    }

}
