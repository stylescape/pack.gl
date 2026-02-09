// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { ArgumentParser } from "../../cli/ArgumentParser.js";
import { ConfigInterface } from "../../interface/ConfigInterface.js";
import { StageInterface } from "../../interface/StageInterface.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";

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
     * Set of loaded config paths to prevent circular inheritance.
     */
    private loadedPaths: Set<string> = new Set();

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
     * Uses `--config` CLI flag if provided, otherwise defaults.
     */
    public async initialize(): Promise<void> {
        const parser = new ArgumentParser();
        const cliFlags = parser.getAllFlags();
        const cliPath =
            typeof cliFlags.config === "string" ? cliFlags.config : undefined;

        const searchPaths = cliPath ? [cliPath] : this.defaultFilenames;

        this.logDebug(`Current working directory: ${process.cwd()}`);
        this.logDebug(
            `Searching for config file${cliPath ? ` from --config=${cliPath}` : ""}...`,
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
            } catch (_error) {
                this.logDebug(`File not accessible: ${resolvedPath}`);

                // ❗ If user explicitly provided --config and it fails, stop immediately
                if (cliPath) {
                    throw new Error(
                        `Configuration file not found or not accessible: ${resolvedPath}`,
                    );
                }
            }
        }

        this.logWarn(
            "No configuration file found. Proceeding with default settings.",
        );
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

        // Reset loaded paths for fresh load
        this.loadedPaths.clear();

        try {
            const config = await this.loadConfigWithInheritance(
                this.configPath,
            );
            this.validateConfig(config);
            this.logDebug(
                `Successfully loaded configuration from: ${this.configPath}`,
            );
            return config;
        } catch (error) {
            this.logError("Failed to load configuration.", error);
            throw new Error(
                `Failed to load configuration: ${(error as Error).message}`,
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

        // Prevent circular inheritance
        if (this.loadedPaths.has(resolvedPath)) {
            throw new Error(
                `Circular config inheritance detected: ${resolvedPath}`,
            );
        }
        this.loadedPaths.add(resolvedPath);

        this.logDebug(`Loading configuration from: ${resolvedPath}`);
        const fileContents = await fs.promises.readFile(resolvedPath, "utf8");
        const config = yaml.load(fileContents) as ConfigInterface;

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
            // Merge stages by name
            stages: this.mergeStages(parent.stages || [], child.stages || []),
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
     * @throws Error if validation fails.
     */
    private validateConfig(config: ConfigInterface): void {
        if (!Array.isArray(config.stages)) {
            throw new Error(
                "Invalid configuration: 'stages' must be an array.",
            );
        }
        this.logDebug("Configuration structure validated successfully.");
    }
}
