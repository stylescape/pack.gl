declare class TypeScriptCompiler {
    private config;
    private static defaultConfig;
    constructor(customConfig?: any);
    compile(filePaths: string[], outDir: string): Promise<void>;
}
export default TypeScriptCompiler;
