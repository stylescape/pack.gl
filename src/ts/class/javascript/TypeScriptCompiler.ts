// ============================================================================
// Import
// ============================================================================

import ts from "typescript";
import path from "path";
import tsConfig from "../../config/ts.config.js"
import fs from "fs";


// ============================================================================
// Types
// ============================================================================

// type CompilerOptions = ts.CompilerOptions | Record<string, unknown>;


// ============================================================================
// Classes
// ============================================================================

/**
 * A utility class to compile TypeScript files into JavaScript based on
 * configurable options. It leverages the TypeScript compiler API to perform
 * the compilation, providing a flexible integration point for projects
 * needing to automate their TypeScript to JavaScript builds.
 */
class TypeScriptCompiler {

    // Parameters
    // ========================================================================

    /**
     *  Configuration for the TypeScript compiler.
     */
    // private config: any;
    private config: ts.CompilerOptions;
    // private parsedConfig: ts.ParsedCommandLine;


    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig: any = tsConfig;
    // private static defaultConfig: ts.CompilerOptions = tsConfig;


    // Constructor
    // ========================================================================

    /**
     * Initializes a new instance of the TypeScriptCompiler with optional
     * custom configuration.
     * @param customConfig Custom configuration settings for the TypeScript
     * compiler.
     */
    constructor(
        customConfig: any = {},
        // customConfig: ts.CompilerOptions = {},
    ) {
        this.config = {
            ...TypeScriptCompiler.defaultConfig,
            ...customConfig
        };
    }
    // /**
    //  * Initializes a new instance of the TypeScriptCompiler with optional
    //  * custom configuration.
    //  * @param configFilePath Path to the tsconfig.json file.
    //  * @param customConfig Custom configuration settings for the TypeScript compiler.
    //  */
    // constructor(configFilePath: string, customConfig: Partial<ts.CompilerOptions> = {}) {
    //     this.parsedConfig = this.loadConfig(configFilePath, customConfig);
    // }


    // Methods
    // ========================================================================

    /**
     * Loads and parses the TypeScript configuration from a tsconfig.json file.
     * @param configFilePath Path to the tsconfig.json file.
     * @param customConfig Additional compiler options to override the default
     * settings.
     * @returns Parsed command line configuration.
     */
    private loadConfig(
        configFilePath: string,
        customConfig: Partial<ts.CompilerOptions>
    ): ts.ParsedCommandLine {

        // Read the config file
        const configFile = ts.readConfigFile(
            configFilePath,
            ts.sys.readFile
        );

        // Check if there was an error reading the config file
        if (configFile.error) {
            const error = ts.flattenDiagnosticMessageText(
                configFile.error.messageText,
                "\n"
            );
            throw new Error(
                `Error reading tsconfig.json: ${error}`
            );
        }

        // Parse the config file content
        const configParseResult = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            path.dirname(configFilePath),
            customConfig
        );

        // Check if there were errors during parsing
        if (configParseResult.errors.length > 0) {
            const errors = configParseResult.errors.map(diagnostic =>
                ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
            ).join("\n");
            throw new Error(`Error parsing tsconfig.json: ${errors}`);
        }

        return configParseResult;
    }

    /**
     * Compiles an array of TypeScript files into JavaScript.
     * @param filePaths An array of paths to TypeScript files to be compiled.
     * @param outDir The directory to output the compiled JavaScript files.
     * @returns A promise that resolves if the compilation is successful, or
     * rejects if it fails.
     */
    // async compile(
    compile(
        filePaths: string[],
        outDir: string,
        // customOptions: ts.CompilerOptions = {}
    ): Promise<void> {
        return new Promise((resolve, reject) => {

            // Merge default options with custom options
            const options: ts.CompilerOptions = {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2015,
                outDir,
                // ...customOptions, // Merges custom compiler options
                ...this.config, // Merges custom compiler options
            };

            // Create a TypeScript compiler host
            const host = ts.createCompilerHost(
                options
            );

            // Create a program with the specified files and options
            const program = ts.createProgram(
                filePaths,
                options,
                host
            );
            
            // Emit the compiled JavaScript files
            const emitResult = program.emit();

            // Check for compilation errors
            const allDiagnostics = ts.getPreEmitDiagnostics(
                program
            ).concat(emitResult.diagnostics);

            allDiagnostics.forEach(diagnostic => {
                // Handle and print diagnostics
                if (diagnostic.file) {
                    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                    const message = ts.flattenDiagnosticMessageText(
                        diagnostic.messageText,
                        "\n"
                    );
                    console.error(
                        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
                    );
                } else {
                    console.error(
                        ts.flattenDiagnosticMessageText(
                            diagnostic.messageText,
                            "\n"
                        )
                    );
                }
            });

            const exitCode = emitResult.emitSkipped ? 1 : 0;
            if (exitCode === 0) {
                console.log("Compilation completed successfully.");
                resolve();
            } else {
                console.error("Compilation failed.");
                reject(new Error("TypeScript compilation failed"));
            }
        });
    }

}


// ============================================================================
// Export
// ============================================================================

export default TypeScriptCompiler;


// ============================================================================
// Example
// ============================================================================

// import TypeScriptCompiler from "./TypeScriptCompiler";

// const compiler = new TypeScriptCompiler({ noImplicitAny: true });
// const filePaths = ["./src/index.ts", "./src/app.ts"];
// const outputDirectory = "./dist";

// compiler.compile(filePaths, outputDirectory)
//     .then(() => console.log("Compilation successful"))
//     .catch(error => console.error("Compilation errors:", error));




























// class TypeScriptCompiler {


//     /**
//      * Initializes a new instance of the TypeScriptCompiler with optional
//      * custom configuration.
//      * @param configFilePath Path to the tsconfig.json file.
//      * @param customConfig Custom configuration settings for the TypeScript compiler.
//      */
//     constructor(configFilePath: string, customConfig: Partial<ts.CompilerOptions> = {}) {
//         this.parsedConfig = this.loadConfig(configFilePath, customConfig);
//     }

//     /**
//      * Loads and parses the TypeScript configuration from a tsconfig.json file.
//      * @param configFilePath Path to the tsconfig.json file.
//      * @param customConfig Additional compiler options to override the default settings.
//      * @returns Parsed command line configuration.
//      */
//     private loadConfig(configFilePath: string, customConfig: Partial<ts.CompilerOptions>): ts.ParsedCommandLine {
//         // Read the config file
//         const configFile = ts.readConfigFile(configFilePath, ts.sys.readFile);

//         // Check if there was an error reading the config file
//         if (configFile.error) {
//             const error = ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n");
//             throw new Error(`Error reading tsconfig.json: ${error}`);
//         }

//         // Parse the config file content
//         const configParseResult = ts.parseJsonConfigFileContent(
//             configFile.config,
//             ts.sys,
//             path.dirname(configFilePath),
//             customConfig
//         );

//         // Check if there were errors during parsing
//         if (configParseResult.errors.length > 0) {
//             const errors = configParseResult.errors.map(diagnostic =>
//                 ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
//             ).join("\n");
//             throw new Error(`Error parsing tsconfig.json: ${errors}`);
//         }

//         return configParseResult;
//     }

//     /**
//      * Compiles an array of TypeScript files into JavaScript.
//      * @param filePaths An array of paths to TypeScript files to be compiled.
//      * @returns A promise that resolves if the compilation is successful, or rejects if it fails.
//      */
//     compile(filePaths: string[]): Promise<void> {
//         return new Promise((resolve, reject) => {
//             // Create a TypeScript program with parsed configuration options
//             const program = ts.createProgram(filePaths, this.parsedConfig.options);

//             // Emit the compiled JavaScript files
//             const emitResult = program.emit();

//             // Gather all diagnostics (errors and warnings)
//             const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

//             // Process and display diagnostics
//             allDiagnostics.forEach(diagnostic => {
//                 if (diagnostic.file) {
//                     const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
//                     const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
//                     console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
//                 } else {
//                     console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
//                 }
//             });

//             // Check if the compilation was successful
//             if (emitResult.emitSkipped) {
//                 console.error("Compilation failed.");
//                 reject(new Error("TypeScript compilation failed"));
//             } else {
//                 console.log("Compilation completed successfully.");
//                 resolve();
//             }
//         });
//     }

// }

// // ============================================================================
// // Exports
// // ============================================================================

// export default TypeScriptCompiler;

// // ============================================================================
// // Example Usage
// // ============================================================================

// // import TypeScriptCompiler from "./TypeScriptCompiler";

// // Ensure you provide the correct path to the tsconfig.json when creating the instance
// // const compiler = new TypeScriptCompiler("./path/to/tsconfig.json", { noImplicitAny: true });
// // const filePaths = ["./src/index.ts", "./src/app.ts"];

// // Compile the TypeScript files to JavaScript
// // compiler.compile(filePaths)
// //     .then(() => console.log("Compilation successful"))
// //     .catch(error => console.error("Compilation errors:", error));