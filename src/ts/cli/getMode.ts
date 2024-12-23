/**
 * Enum for valid modes.
 * Provides a fixed set of values for `development`, `production`, and `none`.
 */
export enum Mode {
    DEVELOPMENT = "development",
    PRODUCTION = "production",
    NONE = "none",
}

/**
 * Parses the `--mode` flag from the CLI arguments.
 * Defaults to `Mode.NONE` if no mode is specified or the value is invalid.
 *
 * @returns The mode as a `Mode` enum value.
 */
export function getMode(): Mode {
    const modeArgIndex = process.argv.findIndex((arg) => arg === "--mode");
    const mode = modeArgIndex !== -1 && process.argv[modeArgIndex + 1] ? process.argv[modeArgIndex + 1] : Mode.NONE;

    if (!Object.values(Mode).includes(mode as Mode)) {
        console.warn(
            `[CLI] Invalid mode: "${mode}". Defaulting to "${Mode.NONE}". Valid modes are: ${Object.values(Mode).join(", ")}.`
        );
        return Mode.NONE;
    }

    return mode as Mode;
}
