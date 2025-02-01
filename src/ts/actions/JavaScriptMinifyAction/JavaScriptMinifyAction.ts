// ============================================================================
// Import
// ============================================================================

import { promises as fs } from "fs";
import path from "path";
import { minify } from "terser";
import terserConfig from "../../config/terser.config.js";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Classes
// ============================================================================

/**
 * JavaScriptMinifyAction handles the minification of JavaScript files.
 * Uses Terser to reduce file size and optimize performance.
 */
export class JavaScriptMinifyAction extends Action {
    /**
     * Executes the JavaScript minification action.
     *
     * @param options - The options containing input and output file paths.
     * @returns A Promise that resolves when the minification process completes.
     * @throws {Error} If input file is missing, minification fails, or output cannot be written.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { inputPath, outputPath, customConfig = {} } = options;

        if (!inputPath || !outputPath) {
            throw new Error("Invalid options: 'inputPath' and 'outputPath' are required.");
        }

        this.logInfo(`Minifying JavaScript file: ${inputPath} → ${outputPath}`);

        try {
            await this.minifyFile(inputPath, outputPath, customConfig);
            this.logInfo(`JavaScript minification completed: ${outputPath}`);
        } catch (error) {
            this.logError("JavaScript minification failed.", error);
            throw error;
        }
    }

    /**
     * Minifies a JavaScript file using Terser.
     *
     * @param inputPath - Path to the input JavaScript file.
     * @param outputPath - Path where the minified file will be saved.
     * @param customConfig - Custom Terser configuration.
     * @returns A Promise that resolves when the minification is complete.
     */
    private async minifyFile(
        inputPath: string,
        outputPath: string,
        customConfig: Record<string, any>,
    ): Promise<void> {
        try {
            const resolvedInputPath = path.resolve(inputPath);
            const resolvedOutputPath = path.resolve(outputPath);

            // Read the JavaScript file
            const inputCode = await fs.readFile(resolvedInputPath, "utf8");

            // Minify using Terser with merged configuration
            const result = await minify(inputCode, { ...terserConfig, ...customConfig });

            if (!result.code) {
                throw new Error("Minification resulted in empty output.");
            }

            // Write minified file
            await fs.writeFile(resolvedOutputPath, result.code, "utf8");

            this.logDebug(`Minified JavaScript file saved to ${resolvedOutputPath}`);
        } catch (error) {
            this.logError(`Error minifying JavaScript file: ${inputPath}`, error);
            throw error;
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Minifies JavaScript files using Terser to reduce size and optimize performance.";
    }
}
