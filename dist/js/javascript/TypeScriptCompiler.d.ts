/**
 * A utility class to compile TypeScript files into JavaScript based on
 * configurable options. It leverages the TypeScript compiler API to perform
 * the compilation, providing a flexible integration point for projects
 * needing to automate their TypeScript to JavaScript builds.
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
     * Initializes a new instance of the TypeScriptCompiler with optional
     * custom configuration.
     * @param customConfig Custom configuration settings for the TypeScript
     * compiler.
     */
    constructor(customConfig?: any);
    /**
     * Loads and parses the TypeScript configuration from a tsconfig.json file.
     * @param configFilePath Path to the tsconfig.json file.
     * @param customConfig Additional compiler options to override the default settings.
     * @returns Parsed command line configuration.
     */
    private loadConfig;
    /**
     * Compiles an array of TypeScript files into JavaScript.
     * @param filePaths An array of paths to TypeScript files to be compiled.
     * @param outDir The directory to output the compiled JavaScript files.
     * @returns A promise that resolves if the compilation is successful, or
     * rejects if it fails.
     */
    compile(filePaths: string[], outDir: string): Promise<void>;
}
export default TypeScriptCompiler;
