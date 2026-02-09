// ============================================================================
// Import
// ============================================================================

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { ActionInterface } from "../../interface/ActionInterface.js";
import { ActionPlugin } from "../../interface/ActionPlugin.js";
import { PluginMetadata } from "../../interface/PluginMetadata.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";

// ============================================================================
// Class
// ============================================================================

/**
 * PluginManager handles discovery, loading, and lifecycle of kist plugins.
 * Supports both npm-installed plugins (@getkist/plugin-*) and local plugins.
 */
export class PluginManager extends AbstractProcess {
    // Parameters
    // ========================================================================

    private static instance: PluginManager | null = null;
    private loadedPlugins: Map<string, PluginMetadata> = new Map();
    private pluginActions: Map<string, new () => ActionInterface> = new Map();

    // Constructor
    // ========================================================================

    private constructor() {
        super();
        this.logInfo("PluginManager initialized.");
    }

    // Singleton Methods
    // ========================================================================

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    public static resetInstance(): void {
        PluginManager.instance = null;
    }

    // Plugin Discovery
    // ========================================================================

    /**
     * Discovers and loads all available plugins from:
     * - node_modules/@getkist/plugin-*
     * - node_modules/kist-plugin-*
     * - Local plugins directory (if configured)
     */
    public async discoverPlugins(options?: {
        localPluginsPath?: string;
        pluginPrefixes?: string[];
    }): Promise<void> {
        this.logInfo("Starting plugin discovery...");

        const prefixes = options?.pluginPrefixes || [
            "@getkist/action-",
            "kist-plugin-",
        ];

        // Discover npm plugins
        await this.discoverNpmPlugins(prefixes);

        // Discover local plugins if path provided
        if (options?.localPluginsPath) {
            await this.discoverLocalPlugins(options.localPluginsPath);
        }

        this.logInfo(
            `Plugin discovery complete. Loaded ${this.loadedPlugins.size} plugins.`,
        );
    }

    /**
     * Discovers plugins installed via npm with specified prefixes
     */
    private async discoverNpmPlugins(prefixes: string[]): Promise<void> {
        const nodeModulesPath = join(process.cwd(), "node_modules");

        try {
            const directories = readdirSync(nodeModulesPath, {
                withFileTypes: true,
            });

            for (const dir of directories) {
                // Check for scoped packages (@getkist/plugin-*)
                if (dir.isDirectory() && dir.name.startsWith("@")) {
                    await this.discoverScopedPlugins(
                        join(nodeModulesPath, dir.name),
                        prefixes,
                    );
                }

                // Check for non-scoped packages (kist-plugin-*)
                for (const prefix of prefixes) {
                    if (
                        dir.isDirectory() &&
                        !prefix.startsWith("@") &&
                        dir.name.startsWith(prefix)
                    ) {
                        await this.loadPlugin(
                            join(nodeModulesPath, dir.name),
                            dir.name,
                        );
                    }
                }
            }
        } catch (error) {
            this.logError("Failed to discover npm plugins.", error);
        }
    }

    /**
     * Discovers plugins in scoped packages (@getkist/*)
     */
    private async discoverScopedPlugins(
        scopePath: string,
        prefixes: string[],
    ): Promise<void> {
        try {
            const packages = readdirSync(scopePath, { withFileTypes: true });

            for (const pkg of packages) {
                for (const prefix of prefixes) {
                    const scopePrefix = prefix.split("/")[1]; // Extract "plugin-" from "@getkist/plugin-"
                    // Check if entry is a directory or a symlink pointing to a directory
                    const pkgPath = join(scopePath, pkg.name);
                    const isDir =
                        pkg.isDirectory() ||
                        (pkg.isSymbolicLink() &&
                            statSync(pkgPath).isDirectory());
                    if (
                        isDir &&
                        scopePrefix &&
                        pkg.name.startsWith(scopePrefix)
                    ) {
                        const fullName = `${scopePath.split("/").pop()}/${pkg.name}`;
                        await this.loadPlugin(
                            join(scopePath, pkg.name),
                            fullName,
                        );
                    }
                }
            }
        } catch (_error) {
            this.logDebug(`No scoped plugins found in ${scopePath}`);
        }
    }

    /**
     * Discovers plugins from a local directory
     */
    private async discoverLocalPlugins(localPath: string): Promise<void> {
        try {
            const pluginPath = join(process.cwd(), localPath);
            const directories = readdirSync(pluginPath, {
                withFileTypes: true,
            });

            for (const dir of directories) {
                if (dir.isDirectory()) {
                    await this.loadPlugin(
                        join(pluginPath, dir.name),
                        `local:${dir.name}`,
                    );
                }
            }
        } catch (_error) {
            this.logDebug(`No local plugins found at ${localPath}`);
        }
    }

    // Plugin Loading
    // ========================================================================

    /**
     * Loads a single plugin from the specified path
     */
    private async loadPlugin(
        pluginPath: string,
        pluginName: string,
    ): Promise<void> {
        try {
            this.logDebug(`Loading plugin: ${pluginName}`);

            // Resolve the correct entry point from package.json
            let entryPoint = pluginPath;
            const packageJsonPath = join(pluginPath, "package.json");
            
            if (existsSync(packageJsonPath)) {
                try {
                    const packageJson = JSON.parse(
                        readFileSync(packageJsonPath, "utf-8")
                    );
                    // Check for module, main, or exports entry points
                    const mainEntry = 
                        packageJson.module ||
                        packageJson.main ||
                        (packageJson.exports?.["."]?.import) ||
                        (packageJson.exports?.["."]?.require) ||
                        (packageJson.exports?.["."]) ||
                        "dist/index.js";
                    entryPoint = join(pluginPath, mainEntry);
                } catch (jsonError) {
                    this.logDebug(`Failed to parse package.json for ${pluginName}`);
                }
            }

            const pluginModule = await import(entryPoint);
            const plugin: ActionPlugin = pluginModule.default || pluginModule;

            if (!plugin || typeof plugin.registerActions !== "function") {
                this.logWarn(
                    `Plugin ${pluginName} does not implement ActionPlugin interface.`,
                );
                return;
            }

            // Get plugin metadata if available
            const metadata: PluginMetadata = {
                name: pluginName,
                version:
                    typeof plugin.version === "string"
                        ? plugin.version
                        : "unknown",
                description:
                    typeof plugin.description === "string"
                        ? plugin.description
                        : undefined,
                actions: [],
            };

            // Register actions from the plugin
            const actions = plugin.registerActions();
            for (const [actionName, actionClass] of Object.entries(actions)) {
                this.pluginActions.set(actionName, actionClass);
                metadata.actions.push(actionName);
                this.logDebug(`  - Registered action: ${actionName}`);
            }

            this.loadedPlugins.set(pluginName, metadata);
            this.logInfo(
                `Plugin "${pluginName}" loaded successfully with ${metadata.actions.length} actions.`,
            );
        } catch (error) {
            this.logError(`Failed to load plugin ${pluginName}:`, error);
        }
    }

    /**
     * Manually register a plugin programmatically
     */
    public registerPlugin(plugin: ActionPlugin, name: string): void {
        this.logInfo(`Manually registering plugin: ${name}`);

        const metadata: PluginMetadata = {
            name,
            version:
                typeof plugin.version === "string"
                    ? plugin.version
                    : "unknown",
            description:
                typeof plugin.description === "string"
                    ? plugin.description
                    : undefined,
            actions: [],
        };

        const actions = plugin.registerActions();
        for (const [actionName, actionClass] of Object.entries(actions)) {
            this.pluginActions.set(actionName, actionClass);
            metadata.actions.push(actionName);
        }

        this.loadedPlugins.set(name, metadata);
        this.logInfo(
            `Plugin "${name}" registered with ${metadata.actions.length} actions.`,
        );
    }

    // Plugin Queries
    // ========================================================================

    /**
     * Gets all actions from loaded plugins
     */
    public getPluginActions(): Map<string, new () => ActionInterface> {
        return new Map(this.pluginActions);
    }

    /**
     * Gets metadata for all loaded plugins
     */
    public getLoadedPlugins(): PluginMetadata[] {
        return Array.from(this.loadedPlugins.values());
    }

    /**
     * Gets metadata for a specific plugin
     */
    public getPluginMetadata(name: string): PluginMetadata | undefined {
        return this.loadedPlugins.get(name);
    }

    /**
     * Checks if a specific plugin is loaded
     */
    public isPluginLoaded(name: string): boolean {
        return this.loadedPlugins.has(name);
    }

    /**
     * Lists all action names from plugins
     */
    public listPluginActions(): string[] {
        return Array.from(this.pluginActions.keys());
    }

    // Cleanup
    // ========================================================================

    /**
     * Clears all loaded plugins and their actions
     */
    public clearPlugins(): void {
        this.loadedPlugins.clear();
        this.pluginActions.clear();
        this.logInfo("All plugins cleared.");
    }
}
