/**
 * LoggerStyles defines terminal color codes for text and background styling.
 * These styles are used to format log messages with colors and effects.
 */
export enum LoggerStyles {
    // Reset and Effects
    // ========================================================================

    /** Clears every active style; append it to end a styled run. */
    Reset = "\x1b[0m",

    /** Increases weight, for emphasis within a message. */
    Bold = "\x1b[1m",

    /** Reduces intensity, for secondary detail such as timestamps. */
    Dim = "\x1b[2m",

    // Foreground Colors
    // ========================================================================

    /** Red text, used for errors. */
    Red = "\x1b[31m",

    /** Green text, used for success. */
    Green = "\x1b[32m",

    /** Yellow text, used for warnings. */
    Yellow = "\x1b[33m",

    /** Blue text, used for informational messages. */
    Blue = "\x1b[34m",

    /** Magenta text, used for highlights. */
    Magenta = "\x1b[35m",

    /** Cyan text, used for labels and identifiers. */
    Cyan = "\x1b[36m",

    /** Bright-black text, used for de-emphasized detail. */
    Gray = "\x1b[90m",

    // Background Colors
    // ========================================================================

    /** Red background, for banner-style error output. */
    BgRed = "\x1b[41m",

    /** Green background, for banner-style success output. */
    BgGreen = "\x1b[42m",

    /** Yellow background, for banner-style warnings. */
    BgYellow = "\x1b[43m",

    /** Blue background, for banner-style informational output. */
    BgBlue = "\x1b[44m",

    /** Magenta background, for banner-style highlights. */
    BgMagenta = "\x1b[45m",

    /** Cyan background, for banner-style labels. */
    BgCyan = "\x1b[46m",

    /** Bright-black background, for de-emphasized banners. */
    BgGray = "\x1b[100m",
}
