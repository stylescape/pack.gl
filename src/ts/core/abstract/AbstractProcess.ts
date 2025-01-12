// ============================================================================
// Import
// ============================================================================

import { Logger } from "../../logger/Logger";

// ============================================================================
// Class
// ============================================================================

/**
 * AbstractProcess provides consistent logging functionality to its subclasses.
 * It leverages a centralized logger to manage different log levels and
 * ensures logging consistency across the application.
 */
export abstract class AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Logger instance for handling log messages.
     */
    protected readonly logger: Logger;

    // Constructor
    // ========================================================================

    /**
     * Constructs an AbstractProcess instance.
     * Initializes the logger to ensure logging capabilities are available to
     * subclasses.
     */
    constructor() {
        this.logger = Logger.getInstance();
    }

    // Logging Methods
    // ========================================================================

    /**
     * Logs an informational message with the originating class name as context.
     * Use this for standard informational messages.
     * @param message - The message to log.
     */
    protected logInfo(message: string): void {
        this.logger.logInfo(this.constructor.name, message);
    }

    /**
     * Logs a debug message with the originating class name as context.
     * @param message - The debug message to log.
     */
    protected logDebug(message: string): void {
        this.logger.logDebug(this.constructor.name, message);
    }

    /**
     * Logs a warning message with the originating class name as context.
     * Use this to highlight potential issues that are non-critical.
     * @param message - The warning message to log.
     */
    protected logWarn(message: string): void {
        this.logger.logWarn(this.constructor.name, message);
    }

    /**
     * Logs an error message with the originating class name as context.
     * Handles any type of error and ensures consistent error reporting.
     * Use this for logging critical issues or exceptions.
     *
     * @param message - A custom message providing additional context for
     * the error.
     * @param error - (Optional) The error to log. Can be a string, an Error
     * object, or other types.
     */
    protected logError(message: string, error?: unknown): void {
        const errorMessage = this.formatError(message, error);
        this.logger.logError(this.constructor.name, errorMessage);
    }

    /**
     * Formats an error message for logging.
     * Combines a custom message with additional error details if available.
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

    /**
     * Logs a success message with the originating class name as context.
     * Use this to indicate successful completion of a process or step.
     *
     * @param message - The success message to log.
     */
    protected logSuccess(message: string): void {
        this.logger.logInfo(this.constructor.name, message);
    }
}
