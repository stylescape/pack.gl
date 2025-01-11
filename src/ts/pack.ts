// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "./core/abstract/AbstractProcess";
import { ConfigStore } from "./core/config/ConfigStore";
import { ActionRegistry } from "./core/pipeline/ActionRegistry";
import { Pipeline } from "./core/pipeline/Pipeline";
import { PipelineManager } from "./core/pipeline/PipelineManager";
import { LiveServer } from "./live/LiveServer";
import { LiveWatcher } from "./live/LiveWatcher";


// ============================================================================
// Constants
// ============================================================================


// ============================================================================
// Class
// ============================================================================

/**
 * The Pack class encapsulates the pack.gl CLI functionality.
 * It manages the pipeline execution, configuration loading, and live reload.
 */
export class Pack extends AbstractProcess {

    // Parameters
    // ========================================================================


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
     * This includes initializing the ActionRegistry, loading the
     * configuration, running the pipeline, and optionally enabling
     * live reload.
     */
    public async run(): Promise<void> {

        this.logInfo("Starting pipeline...");

        try {
            // Initialize the ActionRegistry with available actions
            this.initializeActionRegistry();
            await this.runPipeline();

            if (ConfigStore.getInstance().get<boolean>("options.live.enabled")) {
                this.setupLiveReload();
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
     * Runs the pipeline with the provided configuration.
     */
    private async runPipeline(): Promise<void> {
        const config = ConfigStore.getInstance().getConfig();

        if (!config.stages || !Array.isArray(config.stages)) {
            throw new Error(
                "Invalid configuration format. Ensure 'stages' is an array."
            );
        }

        this.logInfo("Initializing pipeline...");
        const pipeline = new Pipeline(config);

        try {
            await pipeline.run();
            this.logInfo("Pipeline execution finished successfully.");
        } catch (error) {
            this.logError("Error during pipeline execution.", error);
            throw error;
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

    /**
     * Sets up live reload functionality.
     * Monitors file changes and restarts the pipeline when updates are detected.
     */
    private setupLiveReload(): void {

        this.logInfo("Enabling live reload functionality...");

        const liveReloadServer = new LiveServer();
        const pipelineManager = new PipelineManager(liveReloadServer);

        new LiveWatcher((filePath) => {
                this.logInfo(`Detected change in: ${filePath}. Restarting pipeline...`);
            pipelineManager.restartPipelineWithDelay(500);
        });

        pipelineManager.restartPipeline();

        this.registerShutdownHandlers(pipelineManager, liveReloadServer);

        // process.on("SIGINT", () => this.handleShutdown(pipelineManager, liveReloadServer));
        // process.on("SIGTERM", () => this.handleShutdown(pipelineManager, liveReloadServer));
    }

    /**
     * Registers handlers for graceful shutdown signals.
     *
     * @param pipelineManager - The manager responsible for the pipeline process.
     * @param liveReloadServer - The server responsible for live reload connections.
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
     * @param pipelineManager - The manager responsible for the pipeline
     * process.
     * @param liveReloadServer - The server responsible for live reload
     * connections.
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

}
