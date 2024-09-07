declare class StylizedLogger {
    /**
     * A utility class for stylized console logging with foreground and
     * background colors. This class utilizes ANSI escape codes to provide
     * colored logging functionality.
     */
    private styles;
    /**
     * Logs a message with specified foreground and background colors.
     * @param message The message to log.
     * @param fgColor The foreground color, selected from predefined colors.
     * @param bgColor The background color, selected from predefined colors. Defaults to "black".
     */
    log(message: string, fgColor: keyof typeof this.styles.fg, bgColor?: keyof typeof this.styles.bg): void;
    /**
     * Logs a header-styled message, commonly used for titles or important notices.
     * @param message The message to log.
     */
    header(message: string): void;
    /**
     * Logs an error-styled message, commonly used for errors or critical warnings.
     * @param message The message to log.
     */
    error(message: string): void;
    /**
     * Logs a body-styled message, commonly used for standard information.
     * @param message The message to log.
     */
    body(message: string): void;
}
export default StylizedLogger;
