// ============================================================================
// Import
// ============================================================================

import { ConfigInterface } from "../../interface/ConfigInterface";
import { AbstractProcess } from "../abstract/AbstractProcess";
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

    /**
     * Singleton instance of the ConfigStore.
     */
    private static instance: ConfigStore | null = null;

    /**
     * The current configuration stored in the ConfigStore.
     */
    private config: ConfigInterface;

    // Constructor
    // ========================================================================

    /**
     * Private constructor to enforce the singleton pattern.
     * Initializes the store with the default configuration.
     */
    private constructor() {
        super();
        this.config = defaultConfig;
        this.logDebug("ConfigStore initialized with default configuration.");
    }

    // Static Methods
    // ========================================================================

    /**
     * Retrieves the singleton instance of ConfigStore, initializing it if
     * necessary.
     * @returns The singleton instance of ConfigStore.
     */
    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    // Instance Methods
    // ========================================================================

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

        this.logDebug(
            `Configuration key "${key}" retrieved with value: ${JSON.stringify(current)}`,
        );
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
        this.logDebug(
            `Set configuration key "${key}" to: ${JSON.stringify(value)}`,
        );
    }

    /**
     * Merges the provided configuration into the existing configuration.
     * Uses a deep merge strategy to combine objects and overwrite primitives.
     *
     * @param newConfig - The new configuration to merge.
     */
    public merge(newConfig: Partial<ConfigInterface>): void {
        this.config = this.deepMerge(this.config, newConfig);
        this.logDebug("Configuration successfully merged.");
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
    // private deepMerge(target: any, source: any): any {
    //     if (typeof target !== "object" || target === null) {
    //         return source;
    //     }

    //     for (const key of Object.keys(source)) {
    //         if (
    //             source[key] &&
    //             typeof source[key] === "object" &&
    //             !Array.isArray(source[key])
    //         ) {
    //             if (!target[key] || typeof target[key] !== "object") {
    //                 target[key] = {};
    //             }
    //             target[key] = this.deepMerge(target[key], source[key]);
    //         } else {
    //             target[key] = source[key];
    //         }
    //     }

    //     return target;
    // }
    private deepMerge(target: any, source: any): any {
        if (typeof target !== "object" || target === null) {
            return source;
        }

        for (const key of Object.keys(source)) {
            // Prevent prototype pollution
            if (
                key === "__proto__" ||
                key === "constructor" ||
                key === "prototype"
            ) {
                this.logWarn(`Skipping potentially unsafe key: "${key}"`);
                continue;
            }

            if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
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
