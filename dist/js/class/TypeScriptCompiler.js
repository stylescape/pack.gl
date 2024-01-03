"use strict";
// class/TypeScriptCompiler.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2023 Scape Agency BV
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
var typescript_1 = __importDefault(require("typescript"));
var ts_config_js_1 = __importDefault(require("../config/ts.config.js"));
// ============================================================================
// Classes
// ============================================================================
// type CompilerOptions = ts.CompilerOptions | Record<string, unknown>;
/**
 * TypeScriptCompiler class for compiling TypeScript files to JavaScript.
 */
class TypeScriptCompiler {
    // private config: ts.CompilerOptions;
    // private config: { [key: symbol]: any};
    /**
     * Default configuration for the TypeScript compiler.
     */
    static { this.defaultConfig = ts_config_js_1.default; }
    // private static defaultConfig: ts.CompilerOptions = tsConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {any} customConfig - Optional custom configuration object for TypeScript compiler
    //  * @param {ts.CompilerOptions} customConfig - Optional custom configuration object for TypeScript compiler
     */
    constructor(customConfig = {}) {
        this.config = {
            ...TypeScriptCompiler.defaultConfig,
            ...customConfig
        };
    }
    compile(filePaths, outDir) {
        return new Promise((resolve, reject) => {
            // Merge default options with custom options
            const options = {
                module: typescript_1.default.ModuleKind.CommonJS,
                target: typescript_1.default.ScriptTarget.ES2015,
                outDir,
                // ...customOptions, // Merges custom compiler options
                ...this.config
            };
            // Create a TypeScript compiler host
            const host = typescript_1.default.createCompilerHost(options);
            // Create a program with the specified files and options
            const program = typescript_1.default.createProgram(filePaths, options, host);
            // Emit the compiled JavaScript files
            const emitResult = program.emit();
            // Check for compilation errors
            const allDiagnostics = typescript_1.default.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            allDiagnostics.forEach(diagnostic => {
                // Handle and print diagnostics
                if (diagnostic.file) {
                    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                    const message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                    console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
                }
                else {
                    console.error(typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
                }
            });
            const exitCode = emitResult.emitSkipped ? 1 : 0;
            if (exitCode === 0) {
                console.log('Compilation completed successfully.');
                resolve();
            }
            else {
                console.error('Compilation failed.');
                reject(new Error('TypeScript compilation failed'));
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = TypeScriptCompiler;
// /**
//  * Compiles TypeScript files to JavaScript.
//  * 
//  * @param {string[]} filePaths - The paths of TypeScript files to be compiled.
//  * @param {string} outDir - The directory where the compiled JavaScript files will be saved.
//  * @param {ts.CompilerOptions} customOptions - Optional custom TypeScript compiler options.
//  * 
//  * This method sets up a TypeScript program with given file paths and compiler options.
//  * It handles the compilation of TypeScript files into JavaScript, considering any provided custom options.
//  * Compilation errors and diagnostics are logged for debugging purposes.
//  * The method returns a promise that resolves when compilation is successful or rejects in case of errors.
//  */
// compile(
//     filePaths: string[],
//     outDir: string,
//     // customOptions: ts.CompilerOptions = {}
// ): Promise<void> {
//     return new Promise((resolve, reject) => {
//         // Merge default options with custom options
//         const options: ts.CompilerOptions = {
//             module: ts.ModuleKind.CommonJS,
//             target: ts.ScriptTarget.ES2015,
//             outDir,
//             // ...customOptions, // Merges custom compiler options
//             ...this.config, // Merges custom compiler options
//         };
//         // Create a TypeScript compiler host
//         const host = ts.createCompilerHost(options);
//         // Create a program with the specified files and options
//         const program = ts.createProgram(filePaths, options, host);
//         // Emit the compiled JavaScript files
//         const emitResult = program.emit();
//         // Check for compilation errors
//         const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
//         allDiagnostics.forEach(diagnostic => {
//             // Handle and print diagnostics
//             if (diagnostic.file) {
//                 const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
//                 const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
//                 console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
//             } else {
//                 console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
//             }
//         });
//         const exitCode = emitResult.emitSkipped ? 1 : 0;
//         if (exitCode === 0) {
//             console.log('Compilation completed successfully.');
//             resolve();
//         } else {
//             console.error('Compilation failed.');
//             reject(new Error('TypeScript compilation failed'));
//         }
//     });
// }
