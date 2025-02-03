declare class StyleProcessor {
    processPostCSS(css: string, styleOption: "expanded" | "compressed"): Promise<string>;
    private ensureDirectoryExists;
    processStyles(inputFile: string, outputFile: string, styleOption: "expanded" | "compressed"): Promise<void>;
}
export default StyleProcessor;
