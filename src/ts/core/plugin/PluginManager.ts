// ============================================================================
// Import
// ============================================================================

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import type { Dirent } from "fs";
import { basename, dirname, join, resolve } from "path";
import { pathToFileURL } from "url";
import type { ActionInterface } from "../../interface/ActionInterface.js";
import type { ActionPlugin } from "../../interface/ActionPlugin.js";
import type { PluginMetadata } from "../../interface/PluginMetadata.js";
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

    /**
     * Default npm package prefixes used for plugin discovery. These match
     * the published plugin packages (@getkist/action-*) and unscoped
     * community plugins (kist-action-*, kist-plugin-*).
     */
    public static readonly DEFAULT_PLUGIN_PREFIXES = [
        "@getkist/action-",
        "kist-action-",
        "kist-plugin-",
    ];

    /**
     * The process-wide instance, created lazily by {@link getInstance}.
     */
    private static instance: PluginManager | null = null;

    /**
     * Metadata for every plugin loaded so far, keyed by package name. Also
     * serves as the guard that keeps a plugin from being loaded twice.
     */
    private loadedPlugins: Map<string, PluginMetadata> = new Map();

    /**
     * Action constructors contributed by loaded plugins, keyed by action
     * name, ready to be handed to the action registry.
     */
    private pluginActions: Map<string, new () => ActionInterface> = new Map();

    // Constructor
    // ========================================================================

    /**
     * Private to enforce the singleton pattern; use {@link getInstance}.
     */
    private constructor() {
        super();
        this.logInfo("PluginManager initialized.");
    }

    // Singleton Methods
    // ========================================================================

    /**
     * Retrieves the shared PluginManager, creating it on first use.
     *
     * @returns The process-wide PluginManager instance.
     */
    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    /**
     * Discards the shared instance so the next {@link getInstance} builds a
     * fresh one, dropping all discovered plugins and their actions.
     *
     * Intended for tests and for live-reload restarts, where carrying plugin
     * state across runs would be wrong.
     */
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

        const prefixes =
            options?.pluginPrefixes || PluginManager.DEFAULT_PLUGIN_PREFIXES;

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
     * Every `node_modules` directory that applies to the current project,
     * nearest first.
     *
     * Node resolves a dependency by walking up the directory tree, and package
     * managers rely on that: npm and yarn hoist workspace dependencies to the
     * repository root, and pnpm links them into a nested store. Looking only
     * in `cwd/node_modules` finds plugins in a plain single-package install
     * and misses them in every workspace layout.
     *
     * @param cwd - Directory to start from.
     * @returns Absolute paths of existing `node_modules` directories.
     */
    private nodeModulesPaths(cwd: string): string[] {
        const paths: string[] = [];
        let current = resolve(cwd);

        for (;;) {
            const candidate = join(current, "node_modules");
            if (existsSync(candidate)) {
                paths.push(candidate);
            }
            const parent = dirname(current);
            if (parent === current) break;
            current = parent;
        }

        return paths;
    }

    /**
     * Whether a directory entry is a directory, following symlinks.
     *
     * Package managers link rather than copy: pnpm links every dependency
     * into the store, and `npm link` does the same for local development. A
     * plain `isDirectory()` check reports false for those and silently skips
     * the plugin.
     *
     * @param path - Absolute path to the entry.
     * @param entry - The directory entry to test.
     * @returns True when the entry resolves to a directory.
     */
    private isDirectoryEntry(path: string, entry: Dirent): boolean {
        if (entry.isDirectory()) return true;
        if (!entry.isSymbolicLink()) return false;
        try {
            return statSync(path).isDirectory();
        } catch {
            // Broken link.
            return false;
        }
    }

    /**
     * Discovers plugins installed via npm with specified prefixes, searching
     * every applicable `node_modules` directory from the current one upwards.
     * The nearest copy of a package wins, matching Node's own resolution.
     */
    private async discoverNpmPlugins(prefixes: string[]): Promise<void> {
        const roots = this.nodeModulesPaths(process.cwd());

        if (roots.length === 0) {
            this.logDebug(
                "No node_modules directory found; skipping plugin discovery.",
            );
            return;
        }

        for (const nodeModulesPath of roots) {
            try {
                const directories = readdirSync(nodeModulesPath, {
                    withFileTypes: true,
                });

                for (const dir of directories) {
                    const entryPath = join(nodeModulesPath, dir.name);
                    if (!this.isDirectoryEntry(entryPath, dir)) {
                        continue;
                    }

                    // Check for scoped packages (@getkist/action-*)
                    if (dir.name.startsWith("@")) {
                        await this.discoverScopedPlugins(entryPath, prefixes);
                        continue;
                    }

                    // Check for non-scoped packages (kist-action-*)
                    const matches = prefixes.some(
                        (prefix) =>
                            !prefix.startsWith("@") &&
                            dir.name.startsWith(prefix),
                    );
                    if (matches && !this.loadedPlugins.has(dir.name)) {
                        await this.loadPlugin(entryPath, dir.name);
                    }
                }
            } catch (error) {
                // One unreadable root should not stop the search: a parent
                // directory may be outside the project and not our business.
                this.logDebug(
                    `Could not read ${nodeModulesPath}: ${(error as Error).message}`,
                );
            }
        }
    }

    /**
     * Discovers plugins in scoped packages (@getkist/*)
     */
    private async discoverScopedPlugins(
        scopePath: string,
        prefixes: string[],
    ): Promise<void> {
        // Platform-safe scope directory name (e.g. "@getkist")
        const scopeName = basename(scopePath);

        try {
            const packages = readdirSync(scopePath, { withFileTypes: true });

            for (const pkg of packages) {
                // Match the FULL package name (e.g. "@getkist/action-sass")
                // against the configured prefixes, so only the configured
                // scopes are picked up rather than any "@scope/action-*".
                const fullName = `${scopeName}/${pkg.name}`;
                const matches = prefixes.some(
                    (prefix) =>
                        prefix.startsWith("@") && fullName.startsWith(prefix),
                );
                if (!matches) {
                    continue;
                }

                // Check if entry is a directory or a symlink pointing to a
                // directory
                // The nearest copy wins, matching Node's own resolution. This
                // check was missing here, so in a workspace — where the same
                // plugin is visible from several `node_modules` up the tree —
                // the *furthest* copy was loaded last and overwrote the one
                // Node would actually have resolved.
                if (this.loadedPlugins.has(fullName)) {
                    continue;
                }

                const pkgPath = join(scopePath, pkg.name);
                if (this.isDirectoryEntry(pkgPath, pkg)) {
                    await this.loadPlugin(pkgPath, fullName);
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
     * Resolves the `"."` entry of a package's `exports` field to a file path.
     *
     * Conditional exports nest: `{ ".": { "import": { "types": …, "default":
     * "./dist/index.js" } } }` is the shape modern ESM packages use, and kist
     * itself is published that way. Reading `exports["."].import` as if it
     * were always a string handed a whole object to `path.join`, which threw
     * and left the plugin looking simply unloadable.
     *
     * @param entry - The value of `exports["."]`, whatever shape it takes.
     * @returns The resolved relative path, or undefined if there is none.
     */
    private static resolveExport(entry: unknown): string | undefined {
        if (typeof entry === "string") return entry;
        if (!entry || typeof entry !== "object") return undefined;

        const conditions = entry as Record<string, unknown>;
        // In the order Node would consult them for an `import`, skipping
        // "types", which names a declaration file rather than code.
        for (const condition of ["import", "module", "require", "default"]) {
            const resolved = PluginManager.resolveExport(
                conditions[condition],
            );
            if (resolved) return resolved;
        }

        return undefined;
    }

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
                        readFileSync(packageJsonPath, "utf-8"),
                    );
                    const mainEntry =
                        packageJson.module ||
                        packageJson.main ||
                        PluginManager.resolveExport(
                            packageJson.exports?.["."],
                        ) ||
                        "dist/index.js";
                    entryPoint = join(pluginPath, mainEntry);
                } catch (jsonError) {
                    // Surface the malformed package.json instead of silently
                    // falling back to the default entry point.
                    this.logWarn(
                        `Failed to parse package.json for ${pluginName}: ${(jsonError as Error).message}`,
                    );
                }
            }

            // Imported as a file URL. A bare absolute path works on POSIX but
            // is rejected on Windows, where "C:\..." looks like a URL with an
            // unsupported scheme.
            const pluginModule = await import(pathToFileURL(entryPoint).href);
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
