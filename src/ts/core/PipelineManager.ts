// src/live/PipelineManager.ts


// ============================================================================
// Import
// ============================================================================

import { spawn, ChildProcess } from "child_process";
import { LiveReloadServer } from "../core/LiveReloadServer";


// ============================================================================
// Class
// ============================================================================

export class PipelineManager {
    private pipelineProcess: ChildProcess | null = null;

    /**
     * Initializes the PipelineManager with a LiveReloadServer instance.
     * @param reloadServer - The LiveReloadServer instance to notify when the
     * pipeline restarts.
     */
    constructor(private reloadServer: LiveReloadServer) {}

    /**
     * Restarts the pipeline process, killing the existing process if it"s
     * running. Notifies connected clients via the LiveReloadServer after
     * restarting.
     */
    public restartPipeline(): void {
        if (this.pipelineProcess) {
            console.log("Stopping current pipeline process...");
            this.stopPipeline();
        }

        console.log("Starting pipeline...");
        this.pipelineProcess = spawn(
            "npm",
            ["run", "start"],
            { stdio: "inherit" }
        );

        this.pipelineProcess.on("close", (code) => {
            if (code !== 0) {
                console.error(
                    `Pipeline process exited with code ${code}`
                );
            }
            // Reload clients when pipeline restarts
            this.reloadServer.reloadClients();
        });

        this.pipelineProcess.on("error", (error) => {
            console.error(
                "Error starting pipeline process:", error
            );
        });

        this.pipelineProcess.on("exit", (code, signal) => {
            if (signal) {
                console.log(
                    `Pipeline process was killed with signal: ${signal}`
                );
            } else {
                console.log(
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
            this.pipelineProcess.kill("SIGTERM");
            this.pipelineProcess = null;
            console.log(
                "Pipeline process stopped."
            );
        } else {
            console.log(
                "No pipeline process is currently running."
            );
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
        console.log(
            `Delaying pipeline restart by ${delay} milliseconds...`
        );
        setTimeout(() => this.restartPipeline(), delay);
    }
}
