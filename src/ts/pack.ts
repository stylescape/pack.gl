// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "./core/abstract/AbstractProcess";
import { ConfigStore } from "./core/config/ConfigStore";
import { ActionRegistry } from "./core/pipeline/ActionRegistry";
import { PipelineManager } from "./core/pipeline/PipelineManager";
import { LiveServer } from "./live/LiveServer";
import { LiveWatcher } from "./live/LiveWatcher";

// ============================================================================
// Class
// ============================================================================

/**
 * The Pack class encapsulates the pack.gl CLI functionality.
 * It manages the pipeline execution, configuration loading, and live reload.
 */
export class Pack extends AbstractProcess {
    // Constructor
    // ========================================================================

    /**
     * Constructs the Pack class instance and initializes necessary components.
     */
    constructor() {
        super();
        this.logDebug("Pack initialized.");
    }

    // Methods
    // ========================================================================

    /**
     * Executes the Pack workflow.
     *
     * This method orchestrates the execution of the Pack pipeline, starting
     * from initializing the ActionRegistry, loading configuration settings,
     * running the pipeline stages through the `PipelineManager`, and
     * optionally enabling live reload for real-time updates.
     *
     * @returns {Promise<void>} Resolves when the workflow completes successfully.
     * @example
     * const pack = new Pack();
     * pack.run().then(() => console.log("Pipeline execution complete."));
     */
    public async run(): Promise<void> {
        this.logInfo("Starting Pack workflow...");

        try {
            // Initialize the ActionRegistry with available actions
            this.initializeActionRegistry();

            // Create and run the PipelineManager
            const liveReloadEnabled = ConfigStore.getInstance().get<boolean>("options.live.enabled");
            const liveReloadServer = liveReloadEnabled ? new LiveServer() : null;

            const pipelineManager = new PipelineManager(liveReloadServer!);
            await pipelineManager.runPipeline();

            // Setup live reload if enabled
            if (liveReloadEnabled) {
                this.setupLiveReload(pipelineManager, liveReloadServer!);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Initializes the ActionRegistry with available actions.
     * Automatically registers core actions and discovers external plugins.
     */
    private initializeActionRegistry(): void {
        this.logInfo("Initializing ActionRegistry...");
        ActionRegistry.initialize();
        this.logInfo("ActionRegistry initialized successfully.");
    }

    /**
     * Sets up live reload functionality.
     * Monitors file changes and restarts the pipeline when updates are detected.
     *
     * @param pipelineManager - The manager responsible for the pipeline process.
     * @param liveReloadServer - The server for live reload connections.
     */
    private setupLiveReload(
        pipelineManager: PipelineManager,
        liveReloadServer: LiveServer
    ): void {
        this.logInfo("Enabling live reload functionality...");

        new LiveWatcher((filePath) => {
            this.logInfo(`Detected change in: ${filePath}. Restarting pipeline...`);
            pipelineManager.restartPipelineWithDelay(500);
        });

        pipelineManager.restartPipeline();
        this.registerShutdownHandlers(pipelineManager, liveReloadServer);
    }

    /**
     * Registers handlers for graceful shutdown signals.
     *
     * @param pipelineManager - The manager responsible for the pipeline process.
     * @param liveReloadServer - The server for live reload connections.
     */
    private registerShutdownHandlers(
        pipelineManager: PipelineManager,
        liveReloadServer: LiveServer
    ): void {
        process.on("SIGINT", () => this.handleShutdown(pipelineManager, liveReloadServer));
        process.on("SIGTERM", () => this.handleShutdown(pipelineManager, liveReloadServer));
    }

    /**
     * Handles graceful shutdown of the pipeline and live reload server.
     *
     * @param pipelineManager - The manager responsible for the pipeline process.
     * @param liveReloadServer - The server for live reload connections.
     */
    private async handleShutdown(
        pipelineManager: PipelineManager,
        liveReloadServer: LiveServer
    ): Promise<void> {
        this.logInfo("Shutdown signal received. Shutting down...");

        try {
            await pipelineManager.stopPipeline();
            await liveReloadServer.shutdown();
            this.logInfo("Shutdown completed successfully.");
        } catch (error) {
            this.logError("Error during shutdown.", error);
        } finally {
            process.exit(0);
        }
    }

    /**
     * Handles errors occurring during the execution of the Pack workflow.
     *
     * @param error - The error object to log and handle.
     */
    private handleError(error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logError(`An error occurred: ${errorMessage}`, error);
        process.exit(1);
    }
}
