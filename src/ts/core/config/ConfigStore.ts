// ============================================================================
// Import
// ============================================================================

import path from "path";
import fs from "fs/promises";
import yaml from "js-yaml";
import { ArgumentParser } from "../../cli/ArgumentParser";
import { AbstractProcess } from "../abstract/AbstractProcess";
import { ConfigInterface } from "../../interface/ConfigInterface";
import { ConfigLoader } from "./ConfigLoader";


// ============================================================================
// Class
// ============================================================================

/**
 * ConfigStore is a singleton that loads and manages the application's configuration.
 * It prioritizes CLI arguments over configuration file values.
 */
export class ConfigStore extends AbstractProcess {

    // Parameters
    // ========================================================================

    private static instance: ConfigStore | null = null;
    private config: ConfigInterface | null = null;

    private cliParser: ArgumentParser;
    private configLoader: ConfigLoader;


    // Constructor
    // ========================================================================

    /**
     * Private constructor to enforce singleton.
     * 
     * @param cliParser - The CLI argument parser instance.
     * @param configLoader - The ConfigLoader instance for file-based configuration.
     */
    private constructor(cliParser: ArgumentParser, configLoader: ConfigLoader) {
        super();
        this.cliParser = cliParser;
        this.configLoader = configLoader;
        this.logInfo("ConfigStore initialized.");
    }

    /**
     * Initializes the ConfigStore singleton with CLI parser and config loader.
     */
    public static initialize(cliParser: ArgumentParser, configLoader: ConfigLoader): void {
        if (ConfigStore.instance) {
            throw new Error("ConfigStore has already been initialized.");
        }
        ConfigStore.instance = new ConfigStore(cliParser, configLoader);
    }

    /**
     * Retrieves the singleton instance of the ConfigStore.
     */
    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            throw new Error("ConfigStore has not been initialized. Call `initialize()` first.");
        }
        return ConfigStore.instance;
    }

    /**
     * Combines file-based configuration with CLI arguments.
     */
    public async loadConfig(): Promise<ConfigInterface> {
        if (this.config) {
            this.logDebug("Returning cached configuration.");
            return this.config;
        }

        const fileConfig = await this.configLoader.loadConfig();
        const cliOptions = this.cliParser.getAllFlags();

        this.config = {
            ...fileConfig,
            options: { ...fileConfig.options, ...cliOptions },
        };

        this.logInfo("Configuration successfully combined and cached.");
        return this.config;
    }

    /**
     * Retrieves the cached configuration.
     */
    public getConfig(): ConfigInterface {
        if (!this.config) {
            throw new Error("Configuration has not been loaded. Call `loadConfig()` first.");
        }
        return this.config;
    }

    /**
     * Finds the configuration file path based on CLI override or default filenames.
     */
    private async findConfigPath(): Promise<string | null> {
        const possibleFiles = ["pack.yaml", "pack.yml"];

        for (const fileName of possibleFiles) {
            const resolvedPath = path.resolve(process.cwd(), fileName);
            try {
                await fs.access(resolvedPath);
                return resolvedPath;
            } catch {
                continue;
            }
        }

        return null;
    }

    /**
     * Validates the structure of the configuration object.
     */
    private validateConfig(config: ConfigInterface): void {
        if (!Array.isArray(config.stages)) {
            this.logError("Invalid configuration format: 'stages' must be an array.");
            throw new Error("Invalid configuration format: 'stages' must be an array.");
        }
    }

}