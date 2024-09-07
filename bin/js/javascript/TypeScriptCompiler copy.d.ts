import ts from "typescript";
declare class TypeScriptCompiler {
    private config;
    constructor(configFilePath: string, customConfig?: Partial<ts.CompilerOptions>);
    private loadConfig;
    compile(filePaths: string[], outDir: string): Promise<void>;
}
export default TypeScriptCompiler;
