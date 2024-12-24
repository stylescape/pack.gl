// ============================================================================
// Import
// ============================================================================

import { Logger } from "../utils/Logger";

// ============================================================================
// AbstractProcess Class
// ============================================================================

/**
 * AbstractProcess class that provides logging functionality via the Logger class.
 * Other classes can extend this base class to enable consistent logging.
 */
export abstract class AbstractProcess {

    /** Logger instance for handling log messages. */
    protected readonly logger: Logger;

    /**
     * Constructs an AbstractProcess instance.
     * Initializes the logger to ensure logging capabilities are available to
     * subclasses.
     */
    constructor() {
        this.logger = Logger.getInstance();
    }

    /**
     * Logs an informational message with the originating class name as context.
     * Use this for standard informational messages.
     * @param message - The message to log.
     */
    protected log(message: string): void {
        this.logger.log(this.constructor.name, message);
    }

    /**
     * Logs a warning message with the originating class name as context.
     * Use this to highlight potential issues that are non-critical.
     * @param message - The warning message to log.
     */
    protected warn(message: string): void {
        this.logger.warn(this.constructor.name, message);
    }

    /**
     * Logs a verbose debug message with the originating class name as context.
     * Only logs the message if verbose logging is enabled.
     * Use this for detailed debugging information.
     * @param message - The debug message to log.
     */
    protected debug(message: string): void {
        this.logger.debug(this.constructor.name, message);
    }

    /**
     * Logs an error message with the originating class name as context.
     * Handles any type of error and ensures consistent error reporting.
     * Use this for logging critical issues or exceptions.
     * 
     * @param message - A custom message providing additional context for the error.
     * @param error - (Optional) The error to log, can be a string or an Error object.
     */
    protected logError(message: string, error?: unknown): void {
        this.logger.error(this.constructor.name, message, error);
    }

}
