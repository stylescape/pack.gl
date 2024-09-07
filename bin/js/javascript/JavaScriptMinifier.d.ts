declare class JavaScriptMinifier {
    private config;
    private static defaultConfig;
    constructor(customConfig?: any);
    minifyFile(inputPath: string, outputPath: string): Promise<void>;
}
export default JavaScriptMinifier;
