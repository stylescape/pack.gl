/**
 * LoggerStyles defines terminal color codes for text and background styling.
 * These styles are used to format log messages with colors and effects.
 */
export enum LoggerStyles {

    // Reset and Effects
    Reset = "\x1b[0m",
    Bold = "\x1b[1m",
    Dim = "\x1b[2m",

    // Foreground Colors
    Red = "\x1b[31m",
    Green = "\x1b[32m",
    Yellow = "\x1b[33m",
    Blue = "\x1b[34m",
    Magenta = "\x1b[35m",
    Cyan = "\x1b[36m",
    Gray = "\x1b[90m",

    // Background Colors
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgGray = "\x1b[100m",

}
