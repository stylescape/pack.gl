// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { ArgumentParser } from "../../cli/ArgumentParser";
import { ConfigInterface } from "../../interface/ConfigInterface";
import { AbstractProcess } from "../abstract/AbstractProcess";

// ============================================================================
// Class
// ============================================================================

/**
 * ConfigLoader is responsible for loading and parsing configuration files.
 * Supports a custom path via `--config`, and falls back to `kist.yaml` or `kist.yml`.
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
