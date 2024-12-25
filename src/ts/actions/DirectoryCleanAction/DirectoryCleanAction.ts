// ============================================================================
// Import
// ============================================================================

import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";
import path from "path";
import fs from "fs";
import micromatch from "micromatch"; // For glob pattern matching

// ============================================================================
// Classes
// ============================================================================

/**
 * DirectoryCleanAction is a step action responsible for cleaning a directory
 * by deleting all its contents while optionally retaining files and directories
 * that match specified glob patterns.
 */
export class DirectoryCleanAction extends Action {

    /**
     * Executes the directory cleaning action.
     * @param options - The options specific to directory cleaning, including
     * the directory path and glob patterns to retain.
     * @returns A Promise that resolves when the directory has been
     * successfully cleaned, or rejects with an error if the action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const dirPath = options.dirPath as string;
        const keepPatterns = options.keep as string[] | undefined;

        if (!dirPath) {
            throw new Error("Missing required option: dirPath.");
        }

        this.logInfo(`Cleaning directory: ${dirPath}`);

        try {
            await this.cleanDirectoryContents(dirPath, keepPatterns);
            this.logInfo(`Directory cleaned successfully: ${dirPath}`);
        } catch (error) {
            this.logError(`Error cleaning directory ${dirPath}:`, error);
            throw error;
        }
    }

    /**
     * Deletes all contents of a specified directory, excluding files and
     * directories that match specified glob patterns.
     * 
     * @param dirPath - The path to the directory to be cleaned.
     * @param keepPatterns - An optional array of glob patterns for files and directories to retain.
     * @returns A Promise that resolves when the directory has been
     * successfully cleaned.
     * @throws {Error} Throws an error if deleting any file or directory fails.
     */
    private async cleanDirectoryContents(
        dirPath: string,
        keepPatterns?: string[]
    ): Promise<void> {
        if (fs.existsSync(dirPath)) {
            for (const file of fs.readdirSync(dirPath)) {
                const curPath = path.join(dirPath, file);

                // Check if the current file or directory matches any of the keep patterns
                const relativePath = path.relative(dirPath, curPath);
                if (keepPatterns && micromatch.isMatch(relativePath, keepPatterns)) {
                    this.logInfo(`Skipping: ${relativePath}`);
                    continue;
                }

                if (fs.lstatSync(curPath).isDirectory()) {
                    // Recursively clean subdirectory
                    await fs.promises.rmdir(curPath, { recursive: true });
                } else {
                    // Delete file
                    await fs.promises.unlink(curPath);
                }
            }
        } else {
            this.logInfo(`Directory does not exist: ${dirPath}`);
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Cleans a directory by deleting all its contents while retaining files and directories matching specified glob patterns.";
    }
}

// ============================================================================
// Export
// ============================================================================

// export default DirectoryCleanAction;