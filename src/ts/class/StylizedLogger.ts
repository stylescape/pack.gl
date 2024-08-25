// class/StylizedLogger.ts



// ============================================================================
// Import
// ============================================================================


// ============================================================================
// Classes
// ============================================================================

class StylizedLogger {

    /**
     * A utility class for stylized console logging with foreground and
     * background colors. This class utilizes ANSI escape codes to provide
     * colored logging functionality.
     */
    private styles = {
        reset: "\x1b[0m",
        fg: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m"
        },
        bg: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m"
        }
    };

    /**
     * Logs a message with specified foreground and background colors.
     * @param message The message to log.
     * @param fgColor The foreground color, selected from predefined colors.
     * @param bgColor The background color, selected from predefined colors. Defaults to "black".
     */
    log(
        message: string,
        fgColor: keyof typeof this.styles.fg,
        bgColor: keyof typeof this.styles.bg = "black"
    ): void {
        console.log(
            `${this.styles.fg[fgColor]}${this.styles.bg[bgColor]}%s${this.styles.reset}`,
            message
        );
    }

    /**
     * Logs a header-styled message, commonly used for titles or important notices.
     * @param message The message to log.
     */
    header(message: string): void {
        this.log(message, "white", "blue");
    }

    /**
     * Logs an error-styled message, commonly used for errors or critical warnings.
     * @param message The message to log.
     */
    error(message: string): void {
        this.log(message, "white", "red");
    }

    /**
     * Logs a body-styled message, commonly used for standard information.
     * @param message The message to log.
     */
    body(message: string): void {
        this.log(message, "black", "white");
    }
}


// ============================================================================
// Export
// ============================================================================

export default StylizedLogger;


// ============================================================================
// Example
// ============================================================================

// import StylizedLogger from "./StylizedLogger";

// const logger = new StylizedLogger();
// logger.header("Header: This is a header");
// logger.error("Error: Something went wrong");
// logger.body("Body: Here is some detailed information");