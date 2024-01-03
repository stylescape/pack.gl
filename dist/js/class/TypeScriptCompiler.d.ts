/**
 * TypeScriptCompiler class for compiling TypeScript files to JavaScript.
 */
declare class TypeScriptCompiler {
    /**
     *  Configuration for the TypeScript compiler.
     */
    private config;
    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {any} customConfig - Optional custom configuration object for TypeScript compiler
    //  * @param {ts.CompilerOptions} customConfig - Optional custom configuration object for TypeScript compiler
     */
    constructor(customConfig?: any);
    compile(filePaths: string[], outDir: string): Promise<void>;
}
export default TypeScriptCompiler;
