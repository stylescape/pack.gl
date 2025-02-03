// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { ConfigInterface } from "../../interface/ConfigInterface";
import { AbstractProcess } from "../abstract/AbstractProcess";

// ============================================================================
// Class
// ============================================================================

/**
 * ConfigLoader is responsible for loading and parsing configuration files
 * (`kist.yaml` or `kist.yml` by default). It validates the configuration
 * structure and provides it in a usable format for the pipeline.
 * Extends `AbstractProcess` for consistent logging.
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

    // Constructor
    // ========================================================================

    /**
     * Constructs a ConfigLoader instance.
     * Searches for `kist.yaml` or `kist.yml` in the working directory
     * unless a custom path is provided.
     *
     * @param configPath - Optional custom configuration file path.
     */
    constructor(configPath?: string) {
        super();
        if (configPath) {
            this.configPath = path.resolve(process.cwd(), configPath);
            this.logDebug(`Custom configuration path set: ${this.configPath}`);
        } else {
            this.logDebug("ConfigLoader initialized without custom path.");
        }
    }

    // Methods
    // ========================================================================

    /**
     * Initializes the loader by locating the configuration file.
     * Searches for `kist.yaml` or `kist.yml` by default.
     *
     * @param configPath - Optional custom configuration file path.
     */
    public async initialize(configPath?: string): Promise<void> {
        const searchPaths = configPath ? [configPath] : this.defaultFilenames;

        this.logDebug(`Current working directory: ${process.cwd()}`);
        this.logDebug("Searching for configuration files...");

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
            }
        }

        this.logWarn(
            "No configuration file found. Proceeding with default settings.",
        );
    }

    /**
     * Loads and validates the configuration file.
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

        try {
            this.logDebug(`Loading configuration from: ${this.configPath}`);
            const fileContents = await fs.promises.readFile(
                this.configPath,
                "utf8",
            );
            const config = yaml.load(fileContents) as ConfigInterface;

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
