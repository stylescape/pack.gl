declare class StylizedLogger {
    private styles;
    log(message: string, fgColor: keyof typeof this.styles.fg, bgColor?: keyof typeof this.styles.bg): void;
    header(message: string): void;
    error(message: string): void;
    body(message: string): void;
}
export default StylizedLogger;
