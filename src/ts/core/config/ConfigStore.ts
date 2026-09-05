// ============================================================================
// Import
// ============================================================================

import type { ConfigInterface } from "../../interface/ConfigInterface.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { defaultConfig } from "./defaultConfig.js";

// ============================================================================
// Class
// ============================================================================

/**
 * ConfigStore is a singleton that loads and manages the application's configuration.
 * It prioritizes CLI arguments over configuration file values.
 */
export class ConfigStore extends AbstractProcess {
    /**
     * The process-wide instance, created lazily by {@link getInstance}.
     */
    private static instance: ConfigStore | null = null;

    /**
     * The configuration as it currently stands: defaults, overlaid with
     * whatever `merge` and `set` have applied since construction.
     */
    private config: ConfigInterface;

    /**
     * Seeds the store with a private copy of the default configuration.
     *
     * Private to enforce the singleton pattern; use {@link getInstance}.
     */
    private constructor() {
        super();
        // Deep-copied rather than referenced: `merge` and `set` write into
        // this object, and assigning the shared `defaultConfig` literal would
        // let one run's configuration leak into the next — which happens for
        // real on every live-reload restart, and between tests.
        this.config = structuredClone(defaultConfig);
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
     * Discards the singleton so the next call to {@link getInstance} starts
     * from the defaults again. Used by tests and by callers that run more
     * than one pipeline in a single process.
     */
    public static resetInstance(): void {
        ConfigStore.instance = null;
    }

    /**
     * Retrieves a value from the configuration using dot notation.
     *
     * @param key - The key of the configuration to retrieve.
     * @returns The configuration value or undefined if not found.
     */
    public get<T>(key: string): T | undefined {
        const keys = key.split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = this.config;

        for (const k of keys) {
            // A missing path yields undefined rather than throwing, so a
            // partially present branch (`options.live` set to null, say)
            // reads the same as an absent one.
            if (current === null || typeof current !== "object") {
                return undefined;
            }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Intentional console output: printing the config IS the feature.
        // eslint-disable-next-line no-console
        console.log(
            "Current Configuration:",
            JSON.stringify(this.config, null, 2),
        );
    }

    /**
     * Recursively merges `source` into `target`, mutating and returning
     * `target`.
     *
     * Plain objects are merged key by key; arrays and primitives replace the
     * target value outright rather than being combined. Keys that could reach
     * `Object.prototype` (`__proto__`, `constructor`, `prototype`) are
     * skipped with a warning, so untrusted configuration cannot pollute the
     * prototype chain.
     *
     * @param target - The object written into. Mutated in place.
     * @param source - The object whose values take precedence.
     * @returns The mutated `target`, or `source` when `target` is not an
     * object.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
