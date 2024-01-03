import ts from 'typescript';
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
     * @param {ts.CompilerOptions} customConfig - Optional custom configuration object for TypeScript compiler
     */
    constructor(customConfig?: ts.CompilerOptions);
    /**
     * Compiles TypeScript files to JavaScript.
     * @param filePaths - The paths of TypeScript files to be compiled.
     * @param outDir - Optional. The directory where the compiled JavaScript files will be saved.
     * This method sets up a TypeScript program with given file paths and compiler options.
     * It handles the compilation of TypeScript files into JavaScript, considering any provided custom options.
     * Compilation errors and diagnostics are logged for debugging purposes.
     * The method returns a promise that resolves when compilation is successful or rejects in case of errors.
     */
    compile(filePaths: string[], outDir?: string): Promise<void>;
    /**
     * Formats TypeScript compiler diagnostics for readable output.
     * @param diagnostics - Array of TypeScript diagnostics
     */
    private formatDiagnostics;
}
export default TypeScriptCompiler;
