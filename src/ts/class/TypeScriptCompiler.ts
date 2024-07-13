// class/TypeScriptCompiler.ts

// Copyright 2024 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// ============================================================================
// Import
// ============================================================================

// import * as ts from 'typescript';
import ts from 'typescript';
import tsConfig from "../config/ts.config.js"

// type CompilerOptions = ts.CompilerOptions | Record<string, unknown>;


// ============================================================================
// Classes
// ============================================================================

/**
 * TypeScriptCompiler class for compiling TypeScript files to JavaScript.
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
     * Constructs an instance with merged configuration of default and custom options.
     * @param {any} customConfig - Optional custom configuration object for TypeScript compiler
    //  * @param {ts.CompilerOptions} customConfig - Optional custom configuration object for TypeScript compiler
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
            const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            allDiagnostics.forEach(diagnostic => {
                // Handle and print diagnostics
                if (diagnostic.file) {
                    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                    console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
                } else {
                    console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
                }
            });

            const exitCode = emitResult.emitSkipped ? 1 : 0;
            if (exitCode === 0) {
                console.log('Compilation completed successfully.');
                resolve();
            } else {
                console.error('Compilation failed.');
                reject(new Error('TypeScript compilation failed'));
            }
        });
    }

}


// ============================================================================
// Export
// ============================================================================

export default TypeScriptCompiler;
