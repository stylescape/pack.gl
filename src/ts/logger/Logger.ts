// ============================================================================
// Import
// ============================================================================

import { LoggerStyles } from "./LoggerStyles";


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
     * Verbose logging flag
     */
    private verbose: boolean;


    // Constructor
    // ========================================================================

    /**
     * Private constructor to enforce singleton pattern.
     * @param verbose - A flag to enable or disable verbose logging.
     */
    private constructor(
        verbose: boolean = false
    ) {
        this.verbose = verbose;
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
    public static getInstance(): Logger {
        if (!Logger.instance) {
            // Default to non-verbose mode if not initialized explicitly
            Logger.instance = new Logger();
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
     * Constructs and returns a formatted log message string.
     *
     * @param level - The log level (e.g., "INFO", "WARN", "ERROR").
     * @param context - The context or class name where the log originates.
     * @param message - The message content to log.
     * @param fgStyle - The foreground color style to apply to the log level.
     * @param bgStyle - The background color style to apply to the log level
     * (default is reset).
     * @returns A formatted log string with applied styles and context.
     */
    private message(
        level: string,
        context: string,
        message: string,
        fgStyle: LoggerStyles,
        bgStyle: LoggerStyles = LoggerStyles.Reset
    ): string {
        let l = `${fgStyle}${bgStyle}[${level}]${LoggerStyles.Reset} `;
        let c = `[${LoggerStyles.Cyan}${context}${LoggerStyles.Reset}] `;
        let m = `${message}`;
        return (l + c + m);
    }

    /**
     * Logs a message with a class name prefix.
     * 
     * @param context - The originating class name.
     * @param message - The message to log.
     */
    public logInfo(
        context: string,
        message: string
    ): void {

        let log = this.message(
            "INFO",
            context,
            message,
            LoggerStyles.Blue
        );

        console.log(log);

    }

    /**
     * Logs a warning message with a class name prefix.
     * 
     * @param context - The originating class name.
     * @param message - The message to log.
     */
    public logWarn(
        context: string,
        message: string
    ): void {

        let log = this.message(
            "WARN",
            context,
            message,
            LoggerStyles.Yellow
        );

        console.warn(log);

    }

    /**
     * Logs an error message with detailed context, message, and stack trace
     * if verbose mode is enabled.
     * 
     * @param context - The originating module or class name.
     * @param message - A custom message providing additional context for
     * the error.
     * @param error - (Optional) The error object or additional details to log.
     */
    public logError(
        context: string,
        message: string,
        error?: unknown
    ): void {
        const formattedMessage = this.formatError(message, error);

        let log = this.message(
            "ERROR",
            context,
            message,
            LoggerStyles.Red,
            LoggerStyles.BgYellow
        );
        console.error(log);

        if (error instanceof Error && this.verbose && error.stack) {
            console.error(
                `${LoggerStyles.Red}Stack trace:${LoggerStyles.Reset}\n${error.stack}`
            );
        }


    } 

    /**
     * Logs a debug message with a class name prefix.
     * Only logs if verbose mode is enabled.
     * 
     * @param context - The originating class name.
     * @param message - The message to log.
     */
    public logDebug(
        context: string,
        message: string
    ): void {
        if (this.verbose) {

            let log = this.message(
                "DEBUG",
                context,
                message,
                LoggerStyles.Magenta,
            );
            
            console.error(log);

        }
    }

    /**
     * Logs a success message with a class name prefix.
     * @param context - The originating module or class name.
     * @param message - The success message to log.
     */
    public logSuccess(
        context: string,
        message: string
    ): void {

        let log = this.message(
            "SUCCESS",
            context,
            message,
            LoggerStyles.Green,
            LoggerStyles.BgGray
        );

        console.log(log);

    }


    // Utility Methods
    // ========================================================================

    /**
     * Enables verbose logging.
     */
    public enableVerbose(): void {
        this.verbose = true;
    }

    /**
     * Disables verbose logging.
     */
    public disableVerbose(): void {
        this.verbose = false;
    }

    /**
     * Checks whether verbose logging is enabled.
     * @returns `true` if verbose logging is enabled, otherwise `false`.
     */
    public isVerboseEnabled(): boolean {
        return this.verbose;
    }

    /**
     * Formats an error message for logging.
     * Combines a base message with additional error details if available.
     * 
     * @param message - The base error message.
     * @param error - Additional error information, such as an Error object.
     * @returns A formatted string combining the message and error details.
     */
    private formatError(
        message: string,
        error?: unknown
    ): string {
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
