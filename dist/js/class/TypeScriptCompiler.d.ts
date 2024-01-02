/**
 * TypeScriptCompiler class for compiling TypeScript files to JavaScript.
 */
declare class TypeScriptCompiler {
    private config;
    /**
     * Constructs an instance with the provided configuration.
     * @param {any} config - Configuration object
     */
    constructor(config: any);
    /**
     * Compiles TypeScript files to JavaScript.
     *
     * @param {string[]} filePaths - The paths of TypeScript files to be compiled.
     * @param {string} outDir - The directory where the compiled JavaScript files will be saved.
     * @param {ts.CompilerOptions} customOptions - Optional custom TypeScript compiler options.
     *
     * This method sets up a TypeScript program with given file paths and compiler options.
     * It handles the compilation of TypeScript files into JavaScript, considering any provided custom options.
     * Compilation errors and diagnostics are logged for debugging purposes.
     * The method returns a promise that resolves when compilation is successful or rejects in case of errors.
     */
    compile(filePaths: string[], outDir: string): Promise<void>;
}
export default TypeScriptCompiler;
