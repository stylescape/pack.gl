// class/TypeScriptCompiler.ts


// ============================================================================
// Import
// ============================================================================

// import * as ts from "typescript";
import ts from "typescript";
import tsConfig from "../config/ts.config.js"

// type CompilerOptions = ts.CompilerOptions | Record<string, unknown>;


// ============================================================================
// Classes
// ============================================================================

/**
 * A utility class to compile TypeScript files into JavaScript based on configurable options.
 * It leverages the TypeScript compiler API to perform the compilation, providing a flexible
 * integration point for projects needing to automate their TypeScript to JavaScript builds.
 */
 class TypeScriptCompiler {

    /**
     *  Configuration for the TypeScript compiler.
     */
    private config: any;
    // private config: ts.CompilerOptions;
    // private config: { [key: symbol]: any};

    /**
     * Default configuration for the TypeScript compiler.
     */
     private static defaultConfig: any = tsConfig;
     // private static defaultConfig: ts.CompilerOptions = tsConfig;

    /**
     * Initializes a new instance of the TypeScriptCompiler with optional custom configuration.
     * @param customConfig Custom configuration settings for the TypeScript compiler.
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

    /**
     * Compiles an array of TypeScript files into JavaScript.
     * @param filePaths An array of paths to TypeScript files to be compiled.
     * @param outDir The directory to output the compiled JavaScript files.
     * @returns A promise that resolves if the compilation is successful, or rejects if it fails.
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
            const host = ts.createCompilerHost(options);

            // Create a program with the specified files and options
            const program = ts.createProgram(filePaths, options, host);
            
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
                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                    console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
                } else {
                    console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
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