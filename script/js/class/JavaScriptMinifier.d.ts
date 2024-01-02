declare class JavaScriptMinifier {
    private config;
    constructor(config: any);
    minifyFile(inputPath: string, outputPath: string): Promise<void>;
}
export default JavaScriptMinifier;
