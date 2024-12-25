// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../core/abstract/AbstractProcess";
import { OptionsValidator } from "../core/validation/OptionsValidator";
import { OptionsInterface } from "../interface/OptionsInterface";

// ============================================================================
// ArgumentParser Class
// ============================================================================

/**
 * ArgumentParser handles parsing and validating command-line arguments
 * against the structure defined in OptionsInterface.
 * Extends AbstractProcess for consistent logging.
 */
export class ArgumentParser extends AbstractProcess {
    private args: string[];
    private validator: OptionsValidator;

    /**
     * Initializes the ArgumentParser with command-line arguments and an
     * instance of OptionsValidator for validation.
     *
     * @param args - Command-line arguments. Defaults to `process.argv.slice(2)`.
     */
    constructor(args: string[] = process.argv.slice(2)) {
        super();
        this.args = args;
        this.validator = new OptionsValidator();
        this.logInfo("ArgumentParser initialized with arguments.");
    }

    /**
     * Retrieves the value of a specific option from the CLI arguments, with validation.
     *
     * @param key - The name of the option (matches keys in OptionsInterface).
     * @param options - Additional options:
     *  - `default`: The default value to return if the option is not found.
     * @returns The value of the option or the default value if not found.
     * @throws Error if the value is invalid based on the validation rules.
     */
    public getOption<K extends keyof OptionsInterface>(
        key: K,
        options?: { default?: OptionsInterface[K] }
    ): OptionsInterface[K] | undefined {
        const flag = `--${key}`;
        const flagIndex = this.args.findIndex((arg) => arg === flag);
        const value = flagIndex !== -1 && this.args[flagIndex + 1] ? this.args[flagIndex + 1] : options?.default;

        if (value !== undefined) {
            // Create a partial object to validate the specific key-value pair
            const partialOption = { [key]: value } as Partial<OptionsInterface>;
            this.validator.validate(partialOption); // Validate the key-value pair
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
        this.logInfo(`Flag "${flag}" is ${exists ? "present" : "not present"}.`);
        return exists;
    }

    /**
     * Retrieves all CLI flags and their values as a key-value object.
     *
     * @returns An object where keys are flag names and values are either
     * the assigned value or `true` if no value is provided.
     */
    public getAllFlags(): Record<string, string | boolean> {
        const result: Record<string, string | boolean> = {};
        this.args.forEach((arg, index) => {
            if (arg.startsWith("--")) {
                const key = arg.slice(2); // Remove the "--" prefix
                const value = this.args[index + 1];
                result[key] = value && !value.startsWith("--") ? value : true;
            }
        });

        this.logInfo(`Retrieved all flags: ${JSON.stringify(result)}`);
        return result;
    }
}