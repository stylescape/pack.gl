// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../core/abstract/AbstractProcess";
import { OptionsValidator } from "../core/validation/OptionsValidator";
import { OptionsInterface } from "../interface/OptionsInterface";

// ============================================================================
// Class
// ============================================================================

/**
 * ArgumentParser handles parsing and validating command-line arguments
 * against the structure defined in OptionsInterface.
 * Extends AbstractProcess for consistent logging.
 */
export class ArgumentParser extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Command-line arguments to parse, excluding the Node.js and script path.
     */
    private args: string[];

    /**
     * Instance of OptionsValidator for validating parsed arguments.
     */
    private validator: OptionsValidator;

    // Constructor
    // ========================================================================

    /**
     * Initializes the ArgumentParser with command-line arguments and an
     * instance of OptionsValidator for validation.
     *
     * @param args - Command-line arguments. Defaults to `process.argv.slice(2)`.
     */
    constructor() {
        // args: string[] = process.argv.slice(2)
        super();
        // Skip Node.js and script path
        this.args = process.argv.slice(2);

        // console.log(process.argv.slice(2))

        // this.args = args;
        this.validator = new OptionsValidator();
        this.logDebug("ArgumentParser initialized with arguments.");
    }

    // Methods
    // ========================================================================

    /**
     * Retrieves the value of a specific option from the CLI arguments, with
     * validation.
     *
     * @param key - The name of the option (matches keys in OptionsInterface).
     * @param options - Additional options:
     *  - `default`: The default value to return if the option is not found.
     * @returns The value of the option or the default value if not found.
     * @throws Error if the value is invalid based on the validation rules.
     */
    public getOption<K extends keyof OptionsInterface>(
        key: K,
        options?: { default?: OptionsInterface[K] },
    ): OptionsInterface[K] | undefined {
        const flag = `--${key}`;
        const flagIndex = this.args.findIndex((arg) => arg === flag);
        const value =
            flagIndex !== -1 && this.args[flagIndex + 1]
                ? this.args[flagIndex + 1]
                : options?.default;

        if (value !== undefined) {
            // Create a partial object to validate the specific key-value pair
            const partialOption = {
                [key]: value,
            } as Partial<OptionsInterface>;
            // Validate the key-value pair
            this.validator.validate(partialOption);
        }

        this.logInfo(`Retrieved option "${key}" with value: ${value}`);
        return value as OptionsInterface[K];
    }

    /**
     * Checks if a specific flag exists in the CLI arguments.
     *
     * @param key - The name of the flag to check (e.g., "dryRun").
     * @returns `true` if the flag is present, otherwise `false`.
     */
    public hasFlag(key: keyof OptionsInterface): boolean {
        const flag = `--${key}`;
        const exists = this.args.includes(flag);
        this.logInfo(
            `Flag "${flag}" is ${exists ? "present" : "not present"}.`,
        );
        return exists;
    }

    /**
     * Parses all CLI arguments into a key-value object.
     * Flags are treated as boolean if not followed by a value.
     *
     * Example:
     * --live --mode development => { live: true, mode: "development" }
     *
     * @returns A key-value object of all parsed CLI arguments.
     */
    public getAllFlags(): Record<string, string | boolean> {
        const flags: Record<string, string | boolean> = {};

        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            if (arg.startsWith("--")) {
                const key = arg.slice(2);
                const nextArg = this.args[i + 1];
                if (nextArg && !nextArg.startsWith("--")) {
                    flags[key] = nextArg;
                    // Skip the next argument since it's a value
                    i++;
                } else {
                    // Flag with no value is treated as boolean true
                    flags[key] = true;
                }
            }
        }

        return flags;
    }

    /**
     * Retrieves a specific flag value.
     *
     * @param key - The flag name to retrieve.
     * @param defaultValue - The default value if the flag is not present.
     * @returns The value of the flag or the default value.
     */
    public getFlag(
        key: string,
        defaultValue: string | boolean = false,
    ): string | boolean {
        const flags = this.getAllFlags();
        return flags[key] ?? defaultValue;
    }
}
