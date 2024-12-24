// ============================================================================
// Import
// ============================================================================


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

    private static instance: Logger | null = null;
    private verbose: boolean;

    // Constructor
    // ========================================================================

    /**
     * Private constructor to enforce singleton pattern.
     * @param verbose - A flag to enable or disable verbose logging.
     */
    private constructor(
        // verbose: boolean = false
        verbose: boolean = true
    ) {
        this.verbose = verbose;
    }

    // Methods
    // ========================================================================

    /**
     * Initializes the Logger singleton instance.
     * Can only be called once, subsequent calls will throw an error if the
     * Logger is already initialized.
     * @param verbose - A flag to enable or disable verbose logging.
     */
    public static initialize(verbose: boolean): void {
        if (Logger.instance) {
            throw new Error(
                "Logger has already been initialized."
            );
        }
        Logger.instance = new Logger(verbose);
    }

    /**
     * Retrieves the singleton instance of the Logger.
     * Throws an error if the Logger has not been initialized.
     * @returns The Logger instance.
     */
    // public static getInstance(): Logger {
    //     if (!Logger.instance) {
    //         throw new Error(
    //             "Logger is not initialized. Call Logger.initialize(verbose) first."
    //         );
    //     }
    //     return Logger.instance;
    // }
    public static getInstance(): Logger {
        if (!Logger.instance) {
            // Default to non-verbose mode if not initialized explicitly
            Logger.instance = new Logger(false);
        }
        return Logger.instance;
    }

    // /**
    //  * Logs a message with a class name prefix.
    //  * @param context - The originating class name.
    //  * @param message - The message to log.
    //  */
    // log(context: string, message: string): void {
    //     console.log(`[${context}] ${message}`);
    // }

    // /**
    //  * Logs a message only if verbose logging is enabled.
    //  * @param context - The originating class name.
    //  * @param message - The message to log.
    //  */
    // verboseLog(context: string, message: string): void {
    //     if (this.verbose) {
    //         console.log(`[${context} - VERBOSE] ${message}`);
    //     }
    // }

    // /**
    //  * Logs an error message with a class name prefix.
    //  * @param context - The originating class name.
    //  * @param error - The error message or object to log.
    //  */
    // error(
    //     context: string,
    //     error: string | Error
    // ): void {
    //     if (error instanceof Error) {
    //         console.error(
    //             `[${context}] Error: ${error.message}`
    //         );
    //         console.error(
    //             `[${context}] Stack: ${error.stack}`
    //         );
    //     } else {
    //         console.error(
    //             `[${context}] Error: ${error}`
    //         );
    //     }
    // }


    /**
     * Logs a message with a class name prefix.
     * @param context - The originating class name.
     * @param message - The message to log.
     */
    public log(context: string, message: string): void {
        console.log(`[INFO] [${context}] ${message}`);
    }

    /**
     * Logs a warning message with a class name prefix.
     * @param context - The originating class name.
     * @param message - The message to log.
     */
    public warn(context: string, message: string): void {
        console.warn(`[WARN] [${context}] ${message}`);
    }

    /**
     * Logs an error message with detailed context, message, and stack trace.
     * 
     * @param context - The originating module or class name.
     * @param message - A custom message providing additional context for the error.
     * @param error - (Optional) The error object or message to log.
     */
    public error(context: string, message: string, error?: unknown): void {
        console.error(`[ERROR] [${context}] ${message}`);

        if (error) {
            if (error instanceof Error) {
                console.error(`[ERROR] [${context}] ${error.message}`);
                if (this.verbose && error.stack) {
                    console.error(`[ERROR] [${context}] Stack trace:\n${error.stack}`);
                }
            } else {
                console.error(`[ERROR] [${context}] ${error}`);
            }
        }
    }

    /**
     * Logs a debug message with a class name prefix.
     * Only logs if verbose mode is enabled.
     * @param context - The originating class name.
     * @param message - The message to log.
     */
    public debug(context: string, message: string): void {
        if (this.verbose) {
            console.log(`[DEBUG] [${context}] ${message}`);
        }
    }

}
