declare class StylizedLogger {
    /**
     * ANSI escape codes for different text styles
     */
    private styles;
    /**
     * Logs a message with a specific text and background color.
     */
    log(message: string, fgColor: keyof typeof this.styles.fg, bgColor?: keyof typeof this.styles.bg): void;
}
export default StylizedLogger;
