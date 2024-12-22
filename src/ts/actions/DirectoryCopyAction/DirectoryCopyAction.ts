// ============================================================================
// Import
// ============================================================================

import path from "path";
import { promises as fs } from "fs";
import { Action } from "../../core/Action";
import { ActionOptionsType } from "../../types";


// ============================================================================
// Classes
// ============================================================================

/**
 * DirectoryCopyAction is a step action responsible for copying all files and
 * subdirectories from one directory to another, using asynchronous operations
 * for efficient handling.
 */
class DirectoryCopyAction extends Action {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Executes the directory copy action.
     * @param options - The options specific to directory copying, including
     * the source and destination paths.
     * @returns A Promise that resolves when the directory contents have been
     * successfully copied, or rejects with an error if the action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const srcDir = options.srcDir as string;
        const destDir = options.destDir as string;

        if (!srcDir || !destDir) {
            throw new Error(
                "Missing required options: srcDir or destDir."
            );
        }

        this.log(`Copying files from ${srcDir} to ${destDir}`);

        try {
            await this.copyFiles(srcDir, destDir);
            this.log(
                `Files copied successfully from ${srcDir} to ${destDir}`
            );
        } catch (error) {
            this.logError(
                `Error copying files from ${srcDir} to ${destDir}: ${error}`
            );
            throw error;
        }
    }

    /**
     * Asynchronously copies all files and subdirectories from the source
     * directory to the destination directory. If the destination directory
     * does not exist, it will be created.
     * 
     * @param srcDir - The path of the source directory.
     * @param destDir - The path of the destination directory.
     * @throws {Error} If any file or directory could not be copied.
     */
    private async copyFiles(
        srcDir: string,
        destDir: string
    ): Promise<void> {

        const resolvedSrcDir = path.resolve(srcDir);
        const resolvedDestDir = path.resolve(destDir);
        
        try {
            await this.recursiveCopy(resolvedSrcDir, resolvedDestDir);
        } catch (error) {
            throw new Error(
                `Failed to copy from ${resolvedSrcDir} to ${resolvedDestDir}: ${error}`
            );
        }

    }

    /**
     * Recursively copies files and directories from the source to the
     * destination directory.
     * This method creates the destination directory if it does not exist and
     * recursively copies all nested files and directories.
     * 
     * @param srcDir - Source directory.
     * @param destDir - Destination directory.
     */
    private async recursiveCopy(
        srcDir: string,
        destDir: string
    ): Promise<void> {

        await fs.mkdir(destDir, { recursive: true });
        const entries = await fs.readdir(srcDir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            if (entry.isDirectory()) {
                // Recursively copy subdirectory
                await this.recursiveCopy(srcPath, destPath);
            } else {
                // Copy file
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Copies all files and subdirectories from one directory to another, including handling of nested directories.";
    }

}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCopyAction;
