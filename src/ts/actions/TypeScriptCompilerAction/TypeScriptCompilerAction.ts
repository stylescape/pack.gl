// ============================================================================
// Import
// ============================================================================

import fs from "fs/promises";
import ts from "typescript";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";


// ============================================================================
// Classes
// ============================================================================

/**
 * TypeScriptCompilerAction compiles TypeScript files into JavaScript using
 * the TypeScript Compiler API.
 * It can read from an existing `tsconfig.json` or accept custom options
 * to configure the compilation process.
 */
export class TypeScriptCompilerAction extends Action {


    // Methods
    // ========================================================================

    /**
     * Executes the TypeScript compilation action.
     *
     * @param options - The options specific to TypeScript compilation,
     * including `tsConfigPath`, `filePaths`, and `outputDir`.
     * @returns A Promise that resolves when compilation completes.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const {
            tsConfigPath = "./tsconfig.json",
            filePaths = [],
            outputDir = "./dist",
            compilerOptions = {},
        } = options;

        this.logInfo("Initializing TypeScript compilation process...");

        try {
            // Ensure TypeScript files exist
            if (filePaths.length === 0) {
                throw new Error("No TypeScript files provided for compilation.");
            }

            const tsOptions = await this.loadTsConfig(
                tsConfigPath,
                compilerOptions
            );
            await this.compile(filePaths, outputDir, tsOptions);
        } catch (error) {
            this.logError("TypeScript compilation failed", error);
            throw error;
        }
    }

    /**
     * Loads and merges TypeScript configuration from a `tsconfig.json` file.
     *
     * @param tsConfigPath - The path to the `tsconfig.json` file.
     * @param customOptions - Additional compiler options to override defaults.
     * @returns A Promise resolving to merged TypeScript compiler options.
     */
    private async loadTsConfig(
        tsConfigPath: string,
        customOptions: Partial<ts.CompilerOptions>
    ): Promise<ts.CompilerOptions> {
        try {
            const configFile = await fs.readFile(tsConfigPath, "utf-8");
            const parsedConfig = JSON.parse(configFile).compilerOptions || {};

            return {
                ...parsedConfig,
                ...customOptions,
            };
        } catch (error) {
            this.logWarn(
                `Could not read tsconfig.json from ${tsConfigPath}, using defaults.`
            );
            return {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ESNext,
                outDir: "./dist",
                ...customOptions,
            };
        }
    }

    /**
     * Compiles TypeScript files into JavaScript.
     *
     * @param filePaths - The list of TypeScript files to compile.
     * @param outDir - The output directory for compiled JavaScript files.
     * @param options - The TypeScript compiler options.
     * @returns A Promise that resolves if compilation succeeds.
     */
    private async compile(
        filePaths: string[],
        outDir: string,
        options: ts.CompilerOptions
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logInfo(`Compiling TypeScript files to ${outDir}...`);

            const tsOptions = { ...options, outDir };
            const program = ts.createProgram(filePaths, tsOptions);
            const emitResult = program.emit();

            const allDiagnostics = ts
                .getPreEmitDiagnostics(program)
                .concat(emitResult.diagnostics);

            if (allDiagnostics.length > 0) {
                allDiagnostics.forEach((diagnostic) => {
                    const message = ts.flattenDiagnosticMessageText(
                        diagnostic.messageText,
                        "\n"
                    );
                    if (diagnostic.file) {
                        const { line, character } =
                            diagnostic.file.getLineAndCharacterOfPosition(
                                diagnostic.start!
                            );
                        this.logError(
                            `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
                        );
                    } else {
                        this.logError(message);
                    }
                });
            }

            if (emitResult.emitSkipped) {
                this.logError("TypeScript compilation failed.");
                reject(new Error("TypeScript compilation failed"));
            } else {
                this.logInfo("TypeScript compilation completed successfully.");
                resolve();
            }
        });
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Compiles TypeScript files into JavaScript using the TypeScript Compiler API.";
    }
}
