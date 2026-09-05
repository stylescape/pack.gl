// ============================================================================
// Imports
// ============================================================================

import { execFile } from "child_process";
import path from "path";
import util from "util";
import { Action } from "../../core/pipeline/Action.js";
import type { ActionOptionsType } from "../../types/ActionOptionsType.js";

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
                // Documentation generators are verbose; the 1MB default made
                // a large project fail with ENOBUFS.
                { maxBuffer: 64 * 1024 * 1024 },
            );

            // Output on stderr is not failure. Every documentation generator
            // reports warnings there — an undocumented export, a broken
            // link — and treating those as fatal failed the step for a run
            // that had actually succeeded. The exit status is the signal,
            // and a non-zero one has already rejected by this point.
            if (stderr) {
                this.logWarn(stderr.trimEnd());
            }

            if (stdout) {
                this.logInfo(stdout.trimEnd());
            }
            this.logInfo(
                `Documentation successfully generated at: ${resolvedOutputPath}`,
            );
        } catch (error: unknown) {
            this.logError(
                "Error occurred while generating documentation.",
                error,
            );
            const message =
                error instanceof Error ? error.message : String(error);
            throw new Error(`Documentation generation failed: ${message}`, {
                cause: error,
            });
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
