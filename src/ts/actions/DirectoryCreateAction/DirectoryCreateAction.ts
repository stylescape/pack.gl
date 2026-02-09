// ============================================================================
// Import
// ============================================================================

import { promises as fsPromises } from "fs";
import path from "path";
import { Action } from "../../core/pipeline/Action.js";
import { ActionOptionsType } from "../../types/ActionOptionsType.js";

// ============================================================================
// Classes
// ============================================================================

/**
 * DirectoryCreatorAction ensures that specified directory structures
 * exist within a base path. It creates missing directories recursively.
 */
export class DirectoryCreateAction extends Action {
    /**
     * Executes the directory creation action.
     *
     * @param options - The options specifying the base directory and
     * the list of directories to create.
     * @returns A Promise that resolves when all directories are created.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { basePath, directories } = options;

        if (!basePath || !directories || !Array.isArray(directories)) {
            throw new Error(
                "Invalid options: 'basePath' (string) and 'directories' (array) are required.",
            );
        }

        this.logInfo(
            `Ensuring directory structure under base path: ${basePath}`,
        );

        try {
            await this.createDirectories(basePath, directories);
            this.logInfo(
                "All specified directories have been created successfully.",
            );
        } catch (error) {
            this.logError("Failed to create directories.", error);
            throw error;
        }
    }

    /**
     * Ensures that directories exist under the specified base path.
     *
     * @param basePath - The base directory where subdirectories should be created.
     * @param directories - An array of relative paths for directories to create.
     * @returns A Promise that resolves when all directories exist.
     */
    private async createDirectories(
        basePath: string,
        directories: string[],
    ): Promise<void> {
        for (const dir of directories) {
            const dirPath = path.join(basePath, dir);
            try {
                await fsPromises.mkdir(dirPath, { recursive: true });
                this.logDebug(`Directory ensured: ${dirPath}`);
            } catch (error) {
                this.logError(`Error creating directory: ${dirPath}`, error);
                throw error;
            }
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Creates specified directory structures under a given base path.";
    }
}
