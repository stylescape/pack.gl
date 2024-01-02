declare class TypeScriptCompiler {
    private config;
    constructor(config: any);
    compile(filePaths: string[], outDir: string): Promise<void>;
}
export default TypeScriptCompiler;
