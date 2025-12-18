// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import micromatch from "micromatch"; // For glob pattern matching
import path from "path";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Classes
// ============================================================================

/**
 * DirectoryCleanAction is a step action responsible for cleaning a directory
 * by deleting all its contents while optionally retaining files and
 * directories that match specified glob patterns.
 */
export class DirectoryCleanAction extends Action {
    // Methods
    // ========================================================================

    /**
     * Executes the directory cleaning action.
     *
     * @param options - The options specific to directory cleaning, including
     * the directory path and glob patterns to retain.
     * @returns A Promise that resolves when the directory has been
     * successfully cleaned, or silently resolves if the directory does not
     * exist.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const dirPath = options.dirPath as string;
        const keepPatterns = options.keep as string[] | undefined;

        if (!dirPath) {
            throw new Error("Missing required option: dirPath.");
        }

        if (!fs.existsSync(dirPath)) {
            this.logWarn(`Directory does not exist, skipping: ${dirPath}`);
            return; // Exit gracefully if directory does not exist
        }

        this.logInfo(`Cleaning directory: ${dirPath}`);

        try {
            await this.cleanDirectoryContents(dirPath, keepPatterns);
            this.logInfo(`Directory cleaned successfully: ${dirPath}`);
        } catch (error) {
            this.logError(`Error cleaning directory "${dirPath}":`, error);
        }
    }

    /**
     * Deletes all contents of a specified directory, excluding files and
     * directories that match specified glob patterns.
     *
     * @param dirPath - The path to the directory to be cleaned.
     * @param keepPatterns - An optional array of glob patterns for files
     * and directories to retain.
     * @returns A Promise that resolves when the directory has been
     * successfully cleaned.
     * @throws {Error} Throws an error if deleting any file or directory fails.
     */
    private async cleanDirectoryContents(
        dirPath: string,
        keepPatterns?: string[],
    ): Promise<void> {
        const files = await fs.promises.readdir(dirPath);

        for (const file of files) {
            const curPath = path.join(dirPath, file);
            const relativePath = path.relative(dirPath, curPath);

            // Skip files/directories matching keep patterns
            if (
                keepPatterns &&
                micromatch.isMatch(relativePath, keepPatterns)
            ) {
                this.logInfo(`Skipping: ${relativePath}`);
                continue;
            }

            try {
                const stat = await fs.promises.lstat(curPath);
                if (stat.isDirectory()) {
                    // Recursively clean subdirectory
                    await fs.promises.rmdir(curPath, { recursive: true });
                    this.logInfo(`Deleted directory: ${relativePath}`);
                } else {
                    // Delete file
                    await fs.promises.unlink(curPath);
                    this.logInfo(`Deleted file: ${relativePath}`);
                }
            } catch (error) {
                this.logError(`Error deleting: ${relativePath}`, error);
            }
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        const description = `
            Cleans a directory by deleting all its contents while retaining
            files and directories matching specified glob patterns. If the
            directory does not exist, the action will skip gracefully.
        `;
        return description;
    }
}

// ============================================================================
// Export
// ============================================================================

// export default DirectoryCleanAction;
