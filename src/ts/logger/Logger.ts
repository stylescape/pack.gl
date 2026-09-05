// ============================================================================
// Import
// ============================================================================

import { AsyncLocalStorage } from "async_hooks";
import { LoggerStyles } from "./LoggerStyles.js";

// ============================================================================
// Class
// ============================================================================

/**
 * Logger class for handling console messages.
 * Singleton instance ensures consistent logging behavior throughout the
 * application.
 */
export class Logger {
    // Parameters
    // ========================================================================

    /**
     * Singleton instance
     */
    private static instance: Logger | null = null;

    /**
     * Current log level
     */
    private logLevel: "debug" | "info" | "warn" | "error";

    /**
     * Stack of capture buffers opened with {@link beginCapture}. Every emitted
     * line is appended to each open buffer so a caller can record what a
     * section of work printed and replay it later (used by the step cache to
     * make a skipped step look identical to one that actually ran). Nested
     * captures are supported.
     *
     * This stack is process-wide and so is only meaningful for synchronous,
     * strictly nested captures. Concurrent work must use {@link capture}.
     */
    private captureBuffers: string[][] = [];

    /**
     * Buffers belonging to the current asynchronous execution context.
     *
     * Steps in a parallel stage each record their own output, and their
     * `await` points interleave. A single shared stack cannot express that:
     * whoever finishes first pops whichever buffer happens to be on top, so
     * captures end up holding another step's lines. Tracking the open buffers
     * per async context instead means a line is recorded by exactly the
     * captures that are open on the path that emitted it.
     */
    private readonly scopedBuffers = new AsyncLocalStorage<string[][]>();

    // Constructor
    // ========================================================================

    /**
     * Private constructor to enforce singleton pattern.
     * @param logLevel - The log level for controlling log output.
     */
    private constructor(logLevel: "debug" | "info" | "warn" | "error") {
        this.logLevel = logLevel;
    }

    // Singleton Methods
    // ========================================================================

    /**
     * Retrieves the singleton instance of Logger.
     * Initializes a non-verbose Logger instance if it hasn't been explicitly
     * initialized.
     *
     * @returns The Logger instance.
     */
    public static getInstance(
        logLevel: "debug" | "info" | "warn" | "error" = "info",
    ): Logger {
        if (!Logger.instance) {
            // Default to "info" level if not initialized explicitly
            Logger.instance = new Logger(logLevel);
        }
        return Logger.instance;
    }

    /**
     * Resets the Logger instance.
     * Useful for testing or reinitializing the Logger during runtime.
     */
    public static resetInstance(): void {
        Logger.instance = null;
    }

    // Logging Methods
    // ========================================================================

    /**
     * Logs a message with a specific level if it meets the current log level.
     *
     * @param level - The log level (e.g., "INFO", "WARN", "ERROR").
     * @param context - The context or class name where the log originates.
     * @param message - The message content to log.
     * @param fgStyle - The foreground color style to apply to the log level.
     * @param bgStyle - The background color style to apply to the log level (default is reset).
     */
    private log(
        level: "debug" | "info" | "warn" | "error",
        context: string,
        message: string,
        fgStyle: LoggerStyles,
        bgStyle: LoggerStyles = LoggerStyles.Reset,
    ): void {
        if (this.shouldLog(level)) {
            const formattedMessage = `${fgStyle}${bgStyle}[${level.toUpperCase()}]${LoggerStyles.Reset} [${LoggerStyles.Cyan}${context}${LoggerStyles.Reset}] ${message}`;
            for (const buffer of this.captureBuffers) {
                buffer.push(formattedMessage);
            }
            for (const buffer of this.scopedBuffers.getStore() ?? []) {
                buffer.push(formattedMessage);
            }
            // The Logger is the one sanctioned console consumer.
            // eslint-disable-next-line no-console
            console[
                level === "error" ? "error" : level === "warn" ? "warn" : "log"
            ](formattedMessage);
        }
    }

    // Capture and Replay
    // ========================================================================

    /**
     * Starts recording emitted log lines into a new buffer.
     * Must be paired with {@link endCapture}.
     */
    public beginCapture(): void {
        this.captureBuffers.push([]);
    }

    /**
     * Stops the most recently started capture and returns what it recorded.
     *
     * @returns The lines emitted while the capture was open, oldest first.
     */
    public endCapture(): string[] {
        return this.captureBuffers.pop() ?? [];
    }

    /**
     * Runs `work` with a capture open for the duration, recording into `lines`
     * every message emitted on that call's own async execution path.
     *
     * Unlike {@link beginCapture}/{@link endCapture}, concurrent calls do not
     * interfere: two steps running in parallel each collect only their own
     * output. `lines` is filled whether `work` resolves or rejects, so a
     * caller can record what a failing step printed.
     *
     * @param lines - Array to append captured lines to.
     * @param work - The work to run with the capture open.
     * @returns Whatever `work` resolves to.
     */
    public async capture<T>(
        lines: string[],
        work: () => Promise<T>,
    ): Promise<T> {
        const open = [...(this.scopedBuffers.getStore() ?? []), lines];
        return this.scopedBuffers.run(open, work);
    }

    /**
     * Writes previously captured lines back to the console verbatim, so a
     * cached step reads the same as an executed one.
     *
     * @param lines - Lines returned by an earlier {@link endCapture}.
     */
    public replay(lines: string[]): void {
        for (const line of lines) {
            // eslint-disable-next-line no-console
            console.log(line);
        }
    }

    /**
     * Determines if a log should be displayed based on the current log level.
     *
     * @param level - The level of the log being checked.
     * @returns True if the log should be displayed, otherwise false.
     */
    private shouldLog(level: "debug" | "info" | "warn" | "error"): boolean {
        const levels = ["debug", "info", "warn", "error"];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }

    /**
     * Logs an informational message.
     *
     * @param context - The originating class or module.
     * @param message - The informational message to log.
     */
    public logInfo(context: string, message: string): void {
        this.log("info", context, message, LoggerStyles.Blue);
    }

    /**
     * Logs a warning message.
     *
     * @param context - The originating class or module.
     * @param message - The warning message to log.
     */
    public logWarn(context: string, message: string): void {
        this.log("warn", context, message, LoggerStyles.Yellow);
    }

    /**
     * Logs an error message.
     *
     * @param context - The originating class or module.
     * @param message - The error message to log.
     * @param error - (Optional) Additional error details.
     */
    public logError(context: string, message: string, error?: unknown): void {
        const formattedMessage = this.formatError(message, error);
        this.log(
            "error",
            context,
            formattedMessage,
            LoggerStyles.Red,
            LoggerStyles.BgYellow,
        );
    }

    /**
     * Logs a debug message.
     *
     * @param context - The originating class or module.
     * @param message - The debug message to log.
     */
    public logDebug(context: string, message: string): void {
        this.log("debug", context, message, LoggerStyles.Magenta);
    }

    // Utility Methods
    // ========================================================================

    /**
     * Sets the log level dynamically.
     *
     * @param level - The log level to set (e.g., "debug", "info").
     */
    public setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
        this.logLevel = level;
    }

    /**
     * Formats an error message for logging.
     * Combines a base message with additional error details if available.
     *
     * @param message - The base error message.
     * @param error - Additional error information, such as an Error object.
     * @returns A formatted string combining the message and error details.
     */
    private formatError(message: string, error?: unknown): string {
        if (error instanceof Error) {
            return `${message}: ${error.message}`;
        } else if (typeof error === "string") {
            return `${message}: ${error}`;
        } else if (error) {
            return `${message}: ${JSON.stringify(error)}`;
        }
        return message;
    }
}
