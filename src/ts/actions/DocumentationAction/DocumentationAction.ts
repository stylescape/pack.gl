// ============================================================================
// Imports
// ============================================================================

import { execFile } from "child_process";
import path from "path";
import util from "util";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Constants
// ============================================================================

const execFileAsync = util.promisify(execFile);

// ============================================================================
// Classes
// ============================================================================

/**
 * DocumentationAction automates the generation of documentation for software
 * projects. This action allows specifying a documentation generator, source
 * paths, and output locations.
 */
export class DocumentationAction extends Action {
    /**
     * Executes the documentation generation process using the specified command-line tool.
     *
     * @param options - The options specifying the generator tool, source path, and output path.
     * @returns A Promise that resolves when documentation generation completes successfully.
     * @throws {Error} Throws an error if the documentation process fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const {
            generatorCommand = "jsdoc",
            sourcePath = "./src",
            outputPath = "./docs",
            configPath = "",
        } = options;

        if (!generatorCommand) {
            throw new Error(
                "Invalid options: 'generatorCommand' must be specified.",
            );
        }

        const resolvedSourcePath = path.resolve(sourcePath);
        const resolvedOutputPath = path.resolve(outputPath);
        const resolvedConfigPath = configPath
            ? path.resolve(configPath)
            : null;

        this.logInfo(`Generating documentation with ${generatorCommand}...`);
        this.logDebug(`Source Path: ${resolvedSourcePath}`);
        this.logDebug(`Output Path: ${resolvedOutputPath}`);
        if (resolvedConfigPath)
            this.logDebug(`Config Path: ${resolvedConfigPath}`);

        try {
            // Construct command arguments
            const args = resolvedConfigPath
                ? ["-c", resolvedConfigPath, "-d", resolvedOutputPath]
                : [resolvedSourcePath, "-d", resolvedOutputPath];

            // Execute documentation generation command safely
            const { stdout, stderr } = await execFileAsync(
                generatorCommand,
                args,
            );

            if (stderr) {
                this.logError(`Documentation generation failed: ${stderr}`);
                throw new Error(stderr);
            }

            this.logInfo(stdout);
            this.logInfo(
                `Documentation successfully generated at: ${resolvedOutputPath}`,
            );
        } catch (error: any) {
            this.logError(
                "Error occurred while generating documentation.",
                error,
            );
            throw new Error(
                `Documentation generation failed: ${error.message}`,
            );
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Generates project documentation using a specified tool (e.g., JSDoc, TypeDoc).";
    }
}
