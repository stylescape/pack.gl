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
 * FileRenameAction handles renaming files within the file system.
 * Ensures that file renaming operations are handled efficiently and safely.
 */
export class FileRenameAction extends Action {
    /**
     * Executes the file renaming action.
     *
     * @param options - The options specifying the source and target file paths.
     * @returns A Promise that resolves when the file has been successfully renamed.
     * @throws {Error} If the source file does not exist or cannot be renamed.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { srcPath, targetPath } = options;

        if (!srcPath || !targetPath) {
            throw new Error(
                "Invalid options: 'srcPath' and 'targetPath' are required.",
            );
        }

        this.logInfo(`Renaming file: ${srcPath} → ${targetPath}`);

        try {
            await this.renameFile(srcPath, targetPath);
            this.logInfo(`File successfully renamed to ${targetPath}`);
        } catch (error) {
            this.logError("Failed to rename file.", error);
            throw error;
        }
    }

    /**
     * Renames a file from its current path to a new path.
     *
     * @param srcPath - The current file path.
     * @param targetPath - The new file path.
     * @returns A Promise that resolves once the file is successfully renamed.
     */
    private async renameFile(
        srcPath: string,
        targetPath: string,
    ): Promise<void> {
        try {
            const resolvedSrcPath = path.resolve(srcPath);
            const resolvedTargetPath = path.resolve(targetPath);

            await fsPromises.rename(resolvedSrcPath, resolvedTargetPath);
            this.logDebug(
                `File renamed: ${resolvedSrcPath} → ${resolvedTargetPath}`,
            );
        } catch (error) {
            this.logError(
                `Error renaming file: ${srcPath} → ${targetPath}`,
                error,
            );
            throw error;
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Renames a file from a specified source path to a target path.";
    }
}
