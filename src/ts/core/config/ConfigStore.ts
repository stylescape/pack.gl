// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../abstract/AbstractProcess";
import { ConfigInterface } from "../../interface/ConfigInterface";
import { defaultConfig } from "./defaultConfig";


// ============================================================================
// Class
// ============================================================================

/**
 * ConfigStore is a singleton that loads and manages the application's
 * configuration.
 * It prioritizes CLI arguments over configuration file values.
 */
export class ConfigStore extends AbstractProcess {

    // Parameters
    // ========================================================================

    private static instance: ConfigStore | null = null;
    private config: ConfigInterface;
    // private config: ConfigInterface | null = null;


    // Constructor
    // ========================================================================

    /**
     * Private constructor to enforce singleton.
     * Initializes the store with an empty configuration.
     */
    private constructor() {
        super();
        // this.config = { stages: [] };
        this.config = defaultConfig;
        this.logInfo("ConfigStore initialized.");
    }

    /**
     * Retrieves the singleton instance of ConfigStore, initializing it if
     * necessary.
     */
    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    /**
     * Retrieves a value from the configuration by key.
     * Supports nested keys using dot notation (e.g., "options.logLevel").
     * 
     * @param key - The key of the configuration to retrieve.
     * @returns The configuration value or undefined if not found.
     */
    public get<T>(key: string): T | undefined {
        const keys = key.split(".");
        let current: any = this.config;

        for (const k of keys) {
            if (current[k] === undefined) {
                return undefined;
            }
            current = current[k];
        }

        return current as T;
    }

    /**
     * Sets a value in the configuration by key.
     * Supports nested keys using dot notation (e.g., "options.logLevel").
     * 
     * @param key - The key of the configuration to set.
     * @param value - The value to set.
     */
    public set(key: string, value: unknown): void {
        const keys = key.split(".");
        let current: any = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!current[k] || typeof current[k] !== "object") {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = value;
        this.logInfo(`Set configuration key "${key}" to: ${JSON.stringify(value)}`);
    }


    /**
     * Merges the provided configuration into the existing configuration.
     * Uses a deep merge strategy to combine objects and overwrite primitives.
     * 
     * @param newConfig - The new configuration to merge.
     */
    public merge(newConfig: Partial<ConfigInterface>): void {
        this.config = this.deepMerge(this.config, newConfig);
        this.logInfo(
            "Configuration successfully merged."
        );
    }

    /**
     * Retrieves the current configuration.
     * 
     * @returns The current configuration object.
     */
    public getConfig(): ConfigInterface {
        return this.config;
    }

    /**
     * Prints the current configuration to the console in a readable format.
     */
    public print(): void {
        console.log("Current Configuration:");
        console.log(JSON.stringify(this.config, null, 2));
    }

    /**
     * Deeply merges two objects.
     * 
     * @param target - The target object to merge into.
     * @param source - The source object to merge from.
     * @returns The merged object.
     */
    private deepMerge(target: any, source: any): any {
        if (typeof target !== "object" || target === null) {
            return source;
        }

        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== "object") {
                    target[key] = {};
                }
                target[key] = this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }

        return target;
    }
}














    // /**
    //  * Loads the configuration, combining default, file-based, and CLI-provided options.
    //  * @param cliOptions - Options provided via CLI arguments.
    //  */
    // public async loadConfig(cliOptions: Record<string, unknown> = {}): Promise<ConfigInterface> {
    //     if (this.config) {
    //         this.logDebug("Returning cached configuration.");
    //         return this.config;
    //     }

    //     const fileConfig = await this.loadFileConfig();
    //     this.config = {
    //         ...defaultConfig,
    //         ...fileConfig,
    //         options: {
    //             ...defaultConfig.options,
    //             ...fileConfig?.options,
    //             ...cliOptions,
    //         },
    //     };

    //     this.logInfo("Configuration successfully loaded and merged.");
    //     return this.config;
    // }

    // /**
    //  * Retrieves the cached configuration.
    //  */
    // public getConfig(): ConfigInterface {
    //     if (!this.config) {
    //         throw new Error("Configuration has not been loaded. Call `loadConfig()` first.");
    //     }
    //     return this.config;
    // }




    // /**
    //  * Finds the configuration file path based on CLI override or default filenames.
    //  */
    // private async findConfigPath(): Promise<string | null> {
    //     const possibleFiles = ["pack.yaml", "pack.yml"];

    //     for (const fileName of possibleFiles) {
    //         const resolvedPath = path.resolve(process.cwd(), fileName);
    //         try {
    //             await fs.access(resolvedPath);
    //             return resolvedPath;
    //         } catch {
    //             continue;
    //         }
    //     }

    //     return null;
    // }

    /**
     * Validates the structure of the configuration object.
     */
//     private validateConfig(config: ConfigInterface): void {
//         if (!Array.isArray(config.stages)) {
//             this.logError("Invalid configuration format: 'stages' must be an array.");
//             throw new Error("Invalid configuration format: 'stages' must be an array.");
//         }
//     }

// }