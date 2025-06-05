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
 * ConfigStore is a singleton that loads and manages the application's configuration.
 * It prioritizes CLI arguments over configuration file values.
 */
export class ConfigStore extends AbstractProcess {
    // Singleton instance
    private static instance: ConfigStore | null = null;

    // The current configuration stored in the ConfigStore.
    private config: ConfigInterface;

    // Constructor (Private to enforce Singleton Pattern)
    private constructor() {
        super();
        this.config = defaultConfig;
        this.logDebug("ConfigStore initialized with default configuration.");
    }

    /**
     * Retrieves the singleton instance of ConfigStore.
     * @returns The singleton instance of ConfigStore.
     */
    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    /**
     * Retrieves a value from the configuration using dot notation.
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

        this.logDebug(`Configuration key "${key}" retrieved.`);
        return current as T;
    }

    /**
     * Sets a value in the configuration using dot notation.
     *
     * @param key - The key of the configuration to set.
     * @param value - The value to set.
     */
    public set(key: string, value: unknown): void {
        const keys = key.split(".");
        let current: any = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];

            // Prevent prototype pollution by blocking reserved keywords
            if (["__proto__", "constructor", "prototype"].includes(k)) {
                this.logWarn(`Attempted prototype pollution detected: "${k}"`);
                return;
            }

            // Ensure property exists and is an object
            if (
                !Object.prototype.hasOwnProperty.call(current, k) ||
                typeof current[k] !== "object"
            ) {
                current[k] = Object.create(null); // Use a null prototype object
            }
            current = current[k];
        }

        const finalKey = keys[keys.length - 1];

        // Prevent prototype pollution at the final assignment
        if (["__proto__", "constructor", "prototype"].includes(finalKey)) {
            this.logWarn(
                `Attempted prototype pollution detected: "${finalKey}"`,
            );
            return;
        }

        current[finalKey] = value;
        this.logDebug(
            `Set configuration key "${key}" to: ${JSON.stringify(value)}`,
        );
    }

    /**
     * Merges the provided configuration into the existing configuration using deep merge.
     *
     * @param newConfig - The new configuration to merge.
     */
    public merge(newConfig: Partial<ConfigInterface>): void {
        this.config = this.deepMerge(this.config, newConfig);
        this.logDebug("Configuration successfully merged.");
    }

    /**
     * Retrieves the current configuration object.
     * @returns The current configuration.
     */
    public getConfig(): ConfigInterface {
        return this.config;
    }

    /**
     * Prints the current configuration to the console.
     */
    public print(): void {
        console.log(
            "Current Configuration:",
            JSON.stringify(this.config, null, 2),
        );
    }

    /**
     * Deeply merges two objects, preventing prototype pollution.
     *
     * @param target - The target object.
     * @param source - The source object.
     * @returns The merged object.
     */
    private deepMerge(target: any, source: any): any {
        if (typeof target !== "object" || target === null) {
            return source;
        }

        for (const key of Object.keys(source)) {
            // Prevent prototype pollution
            if (["__proto__", "constructor", "prototype"].includes(key)) {
                this.logWarn(`Skipping unsafe key during merge: "${key}"`);
                continue;
            }

            if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
                if (
                    !Object.prototype.hasOwnProperty.call(target, key) ||
                    typeof target[key] !== "object"
                ) {
                    target[key] = Object.create(null);
                }
                target[key] = this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }

        return target;
    }
}
