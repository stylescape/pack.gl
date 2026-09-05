// ============================================================================
// Import
// ============================================================================

import fs from "fs";
// js-yaml 5 is ESM with named exports only; it no longer has a default export.
import { load as loadYaml } from "js-yaml";
import path from "path";
import {
    ConfigError,
    ConfigNotFoundError,
    ConfigParseError,
    ConfigValidationError,
} from "../../errors/index.js";
import type { ConfigInterface } from "../../interface/ConfigInterface.js";
import type { StageInterface } from "../../interface/StageInterface.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { SchemaValidator } from "../validation/SchemaValidator.js";

// ============================================================================
// Class
// ============================================================================

/**
 * ConfigLoader is responsible for loading and parsing configuration files.
 * Supports a custom path via `--config`, and falls back to `kist.yaml` or `kist.yml`.
 * Also supports config inheritance via the `extends` property.
 */
export class ConfigLoader extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Resolved path to the configuration file, if found.
     */
    private configPath: string | null = null;

    /**
     * Default filenames to search for configuration files.
     */
    private readonly defaultFilenames = ["kist.yaml", "kist.yml"];

    /**
     * The chain of files currently being resolved, used to detect circular
     * inheritance.
     *
     * This is the ancestor chain, not every file seen: a path is removed once
     * its own inheritance has been resolved. Keeping every visited path made
     * a diamond — two parents that share a grandparent, which is a perfectly
     * ordinary way to factor configuration — look like a cycle.
     */
    private resolving: Set<string> = new Set();

    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.logDebug("ConfigLoader initialized.");
    }

    // Methods
    // ========================================================================

    /**
     * Initializes the loader by locating the configuration file.
     *
     * @param configPath - Explicit path to use, as supplied by `--config`.
     * When omitted, the flag is read from argv and, failing that, the default
     * filenames are searched.
     */
    public async initialize(configPath?: string): Promise<void> {
        const searchPaths = configPath ? [configPath] : this.defaultFilenames;

        this.logDebug(`Current working directory: ${process.cwd()}`);
        this.logDebug(
            `Searching for config file${configPath ? ` from --config=${configPath}` : ""}...`,
        );

        for (const fileName of searchPaths) {
            const resolvedPath = path.resolve(process.cwd(), fileName);
            this.logDebug(`Checking: ${resolvedPath}`);

            try {
                await fs.promises.access(
                    resolvedPath,
                    fs.constants.F_OK | fs.constants.R_OK,
                );
                this.configPath = resolvedPath;
                this.logDebug(`Configuration file found: ${resolvedPath}`);
                return;
            } catch (error) {
                this.logDebug(`File not accessible: ${resolvedPath}`);

                // ❗ If user explicitly provided --config and it fails, stop immediately
                if (configPath) {
                    throw new ConfigNotFoundError(
                        resolvedPath,
                        error as Error,
                    );
                }
            }
        }

        this.logWarn(
            "No configuration file found. Proceeding with default settings.",
        );
    }

    /**
     * The path the configuration was loaded from, or null when none was
     * found and defaults are in use.
     */
    public getConfigPath(): string | null {
        return this.configPath;
    }

    /**
     * Loads and validates the configuration file.
     * Supports inheritance via the `extends` property.
     *
     * @returns Parsed and validated configuration object.
     * @throws Error if the configuration file cannot be read or validated.
     */
    public async loadConfig(): Promise<ConfigInterface> {
        if (!this.configPath) {
            this.logWarn(
                "No configuration file found. Using default configuration.",
            );
            return { stages: [] };
        }

        // Reset the ancestor chain for a fresh load
        this.resolving.clear();

        try {
            const config = await this.loadConfigWithInheritance(
                this.configPath,
            );
            this.validateConfig(config, this.configPath);
            this.logDebug(
                `Successfully loaded configuration from: ${this.configPath}`,
            );
            return config;
        } catch (error) {
            this.logError("Failed to load configuration.", error);
            throw new ConfigError(
                `Failed to load configuration: ${(error as Error).message}`,
                { configPath: this.configPath },
                error as Error,
            );
        }
    }

    /**
     * Loads a config file and resolves any inheritance.
     *
     * @param configPath - Path to the config file to load.
     * @returns Merged configuration with inherited values.
     */
    private async loadConfigWithInheritance(
        configPath: string,
    ): Promise<ConfigInterface> {
        const resolvedPath = path.resolve(configPath);

        // Prevent circular inheritance: a file may be reached more than once
        // through different branches, but never while it is still resolving
        // its own parents.
        if (this.resolving.has(resolvedPath)) {
            throw new ConfigError(
                `Circular config inheritance detected: ${resolvedPath}`,
                { configPath: resolvedPath },
            );
        }
        this.resolving.add(resolvedPath);

        try {
            return await this.readAndResolve(resolvedPath);
        } finally {
            this.resolving.delete(resolvedPath);
        }
    }

    /**
     * Reads one configuration file and merges in whatever it extends.
     *
     * @param resolvedPath - Absolute path of the file to read.
     * @returns The configuration, with inheritance applied.
     */
    private async readAndResolve(
        resolvedPath: string,
    ): Promise<ConfigInterface> {
        this.logDebug(`Loading configuration from: ${resolvedPath}`);
        const fileContents = await fs.promises.readFile(resolvedPath, "utf8");
        let parsed: unknown;
        try {
            parsed = loadYaml(fileContents);
        } catch (error) {
            throw new ConfigParseError(
                resolvedPath,
                (error as Error).message,
                error as Error,
            );
        }

        // A file that parses to a scalar or to nothing at all is not a
        // configuration; saying so beats a TypeError from reading `extends`
        // off null further down.
        if (parsed === null || typeof parsed !== "object") {
            throw new ConfigParseError(
                resolvedPath,
                "expected a mapping of configuration keys at the top level.",
            );
        }

        const config = parsed as ConfigInterface;

        // Handle inheritance
        if (config.extends) {
            const parentPaths = Array.isArray(config.extends)
                ? config.extends
                : [config.extends];
            const configDir = path.dirname(resolvedPath);

            // Load and merge parent configs in order
            let mergedConfig: ConfigInterface = { stages: [] };

            for (const parentPath of parentPaths) {
                const absoluteParentPath = path.resolve(configDir, parentPath);
                this.logDebug(`Loading parent config: ${absoluteParentPath}`);
                const parentConfig =
                    await this.loadConfigWithInheritance(absoluteParentPath);
                mergedConfig = this.mergeConfigs(mergedConfig, parentConfig);
            }

            // Merge current config on top of parents (child overrides parent)
            // Remove extends from final config
            const { extends: _extends, ...configWithoutExtends } = config;
            return this.mergeConfigs(mergedConfig, configWithoutExtends);
        }

        return config;
    }

    /**
     * Deep merges two config objects. Child values override parent values.
     * Stages are merged by name - if a child stage has the same name as a
     * parent stage, the child replaces the parent. Otherwise, stages are
     * concatenated.
     *
     * @param parent - Parent configuration.
     * @param child - Child configuration (takes precedence).
     * @returns Merged configuration.
     */
    private mergeConfigs(
        parent: ConfigInterface,
        child: ConfigInterface,
    ): ConfigInterface {
        const merged: ConfigInterface = {
            // Deep merge metadata
            metadata: {
                ...(parent.metadata || {}),
                ...(child.metadata || {}),
            },
            // Deep merge options
            options: this.deepMerge(parent.options || {}, child.options || {}),
            // Merge stages by name. `parent` is always a config this method
            // produced (or the `{ stages: [] }` seed), so its stages are
            // guaranteed to be an array; `child` comes straight from YAML.
            stages: this.mergeStages(parent.stages, child.stages || []),
        };

        // Clean up empty metadata
        if (merged.metadata && Object.keys(merged.metadata).length === 0) {
            delete merged.metadata;
        }

        return merged;
    }

    /**
     * Merges stages by name. Child stages with the same name as parent
     * stages replace them. Child stages without matching parent names
     * are appended.
     *
     * @param parentStages - Parent stage list.
     * @param childStages - Child stage list.
     * @returns Merged stage list.
     */
    private mergeStages(
        parentStages: StageInterface[],
        childStages: StageInterface[],
    ): StageInterface[] {
        const parentByName = new Map<string, StageInterface>();
        for (const stage of parentStages) {
            parentByName.set(stage.name, stage);
        }

        // Track which parent stages have been replaced
        const replacedNames = new Set<string>();

        // Process child stages
        const mergedStages: StageInterface[] = [];

        for (const childStage of childStages) {
            if (parentByName.has(childStage.name)) {
                // Child replaces parent stage with same name
                replacedNames.add(childStage.name);
            }
            mergedStages.push(childStage);
        }

        // Prepend parent stages that weren't replaced
        const unreplacedParentStages = parentStages.filter(
            (stage) => !replacedNames.has(stage.name),
        );

        return [...unreplacedParentStages, ...mergedStages];
    }

    /**
     * Deep merges two objects.
     *
     * @param target - Target object.
     * @param source - Source object (takes precedence).
     * @returns Merged object.
     */
    private deepMerge<T extends Record<string, unknown>>(
        target: T,
        source: T,
    ): T {
        const result = { ...target } as T;

        for (const key of Object.keys(source) as (keyof T)[]) {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (
                sourceValue &&
                typeof sourceValue === "object" &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === "object" &&
                !Array.isArray(targetValue)
            ) {
                result[key] = this.deepMerge(
                    targetValue as Record<string, unknown>,
                    sourceValue as Record<string, unknown>,
                ) as T[keyof T];
            } else {
                result[key] = sourceValue;
            }
        }

        return result;
    }

    /**
     * Validates the structure of the configuration.
     *
     * @param config - The configuration object to validate.
     * @param configPath - The file it was read from, for error reporting.
     * @throws ConfigValidationError if validation fails.
     */
    private validateConfig(config: ConfigInterface, configPath: string): void {
        if (!Array.isArray(config.stages)) {
            throw new ConfigValidationError(
                ["Invalid configuration: 'stages' must be an array."],
                configPath,
            );
        }

        // Validate the file against the published JSON Schema — the same one
        // editors use — so a typo is reported here, with its location, rather
        // than as a downstream failure. Only file-sourced configuration is
        // checked: programmatic configs may legitimately carry functions
        // (`hooks`, `validateConfig`) and action objects, which YAML cannot
        // express and the schema therefore rejects.
        new SchemaValidator().validate(config, configPath);

        this.logDebug("Configuration structure validated successfully.");
    }
}
