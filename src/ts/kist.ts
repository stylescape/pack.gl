// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "./core/abstract/AbstractProcess.js";
import { ConfigStore } from "./core/config/ConfigStore.js";
import { ActionRegistry } from "./core/pipeline/ActionRegistry.js";
import { PipelineManager } from "./core/pipeline/PipelineManager.js";
import { PluginManager } from "./core/plugin/PluginManager.js";
import { ConfigValidator } from "./core/validation/ConfigValidator.js";
import { LiveServer } from "./live/LiveServer.js";
import { LiveWatcher } from "./live/LiveWatcher.js";

// ============================================================================
// Class
// ============================================================================

/**
 * The Kist class encapsulates the kist CLI functionality.
 * It manages the pipeline execution, configuration loading, and live reload.
 */
export class Kist extends AbstractProcess {
    // Constructor
    // ========================================================================

    /**
     * Constructs the Kist class instance and initializes necessary components.
     */
    constructor() {
        super();
        this.logDebug("Kist initialized.");
    }

    // Methods
    // ========================================================================

    /**
     * Executes the Kist workflow.
     *
     * This method orchestrates the execution of the Kist pipeline, starting
     * from initializing the ActionRegistry, loading configuration settings,
     * running the pipeline stages through the `PipelineManager`, and
     * optionally enabling live reload for real-time updates.
     *
     * @returns {Promise<void>} Resolves when the workflow completes successfully.
     * @example
     * const Kist = new Kist();
     * Kist.run().then(() => console.log("Pipeline execution complete."));
     */
    public async run(): Promise<void> {
        this.logInfo("Starting Kist workflow...");

        await this.prepare();

        // Create and run the PipelineManager. Live mode is suppressed in a
        // rebuild child process: that child exists only to run the pipeline
        // once, and starting a second server and watcher there would bind an
        // already-taken port and spawn a rebuild child of its own.
        const liveReloadEnabled =
            ConfigStore.getInstance().get<boolean>("options.live.enabled") &&
            !PipelineManager.isRebuildChild();
        const liveReloadServer = liveReloadEnabled ? new LiveServer() : null;

        const pipelineManager = new PipelineManager(
            liveReloadServer ?? undefined,
        );

        try {
            await pipelineManager.runPipeline();
        } catch (error) {
            // Outside live mode a failed build is the result, and the CLI
            // turns it into a non-zero exit status. In live mode it is just
            // the current state of the code: report it and keep serving, so
            // the next save gets a chance to fix it.
            if (!liveReloadServer) {
                throw error;
            }
            this.logError("Initial build failed. Waiting for changes.", error);
        }

        // Setup live reload if enabled. The server is non-null here
        // precisely because `liveReloadEnabled` is what created it.
        if (liveReloadServer) {
            this.setupLiveReload(pipelineManager, liveReloadServer);
        }
    }

    /**
     * Prepares the workflow without running it: discovers plugins, registers
     * actions, and validates the merged configuration.
     *
     * Separated from {@link run} so the CLI's inspection commands
     * (`--dry-run`, `--graph`, `validate`) can report on a fully resolved
     * configuration without executing a single step.
     *
     * @throws Error if the configuration is invalid.
     */
    public async prepare(): Promise<void> {
        // Initialize the ActionRegistry with available actions
        await this.initializeActionRegistry();

        // Validate the merged configuration now that all core and plugin
        // actions are registered, so a malformed kist.yml fails fast with
        // a clear message instead of deep inside the pipeline.
        this.validateConfiguration();
    }

    /**
     * Validates the merged configuration against the full validation suite
     * (stages, steps, and registered actions).
     *
     * @throws Error if the configuration is invalid.
     */
    private validateConfiguration(): void {
        this.logInfo("Validating configuration...");
        const config = ConfigStore.getInstance().getConfig();
        new ConfigValidator().validate(config);
        this.logInfo("Configuration validated successfully.");
    }

    /**
     * Initializes the ActionRegistry with available actions.
     * Automatically registers core actions and discovers external plugins.
     */
    private async initializeActionRegistry(): Promise<void> {
        this.logInfo("Initializing plugin system...");

        // Initialize and discover plugins first (uses the PluginManager's
        // default prefixes; pass `pluginPrefixes` here only to override them)
        const pluginManager = PluginManager.getInstance();
        await pluginManager.discoverPlugins();

        // Log loaded plugins
        const plugins = pluginManager.getLoadedPlugins();
        if (plugins.length > 0) {
            this.logInfo(`Loaded ${plugins.length} plugin(s):`);
            plugins.forEach((plugin) => {
                this.logInfo(
                    `  - ${plugin.name} v${plugin.version} (${plugin.actions.length} actions)`,
                );
            });
        } else {
            this.logDebug("No external plugins found.");
        }

        // Initialize ActionRegistry (will register core + plugin actions)
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
        liveReloadServer: LiveServer,
    ): void {
        this.logInfo("Enabling live reload functionality...");

        new LiveWatcher((filePath) => {
            this.logInfo(
                `Detected change in: ${filePath}. Restarting pipeline...`,
            );
            pipelineManager.restartPipelineWithDelay(500);
        });

        // The pipeline has already run once, in this process, just above.
        // Kicking off a rebuild here as well only built everything twice.
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
        liveReloadServer: LiveServer,
    ): void {
        process.on("SIGINT", () =>
            this.handleShutdown(pipelineManager, liveReloadServer),
        );
        process.on("SIGTERM", () =>
            this.handleShutdown(pipelineManager, liveReloadServer),
        );
    }

    /**
     * Handles graceful shutdown of the pipeline and live reload server.
     *
     * @param pipelineManager - The manager responsible for the pipeline process.
     * @param liveReloadServer - The server for live reload connections.
     */
    private async handleShutdown(
        pipelineManager: PipelineManager,
        liveReloadServer: LiveServer,
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
