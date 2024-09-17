import { BaseAction } from '../../core/BaseAction';
import { ActionOptionsType } from '../../types/ActionOptionsType';
import fs from 'fs';
import path from 'path';

/**
 * FileCopyAction is a step action responsible for copying files from a source
 * location to a destination directory. This action handles file path resolution
 * and ensures that existing files in the destination can be replaced if necessary.
 */
export class FileCopyAction extends BaseAction {

    /**
     * Executes the file copy action.
     * @param options - The options specific to file copying, including source file and destination directory.
     * @returns A Promise that resolves when the file has been successfully copied, or rejects with an error if the action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const srcFile = options.srcFile as string;
        const destDir = options.destDir as string;

        if (!srcFile || !destDir) {
            throw new Error('Missing required options: srcFile or destDir.');
        }

        this.log(`Copying file from ${srcFile} to ${destDir}.`);

        try {
            await this.copyFileToDirectory(srcFile, destDir);
            this.log(`File copied successfully from ${srcFile} to ${destDir}.`);
        } catch (error) {
            this.logError(`Error copying file from ${srcFile} to ${destDir}: ${error}`);
            throw error;
        }
    }

    /**
     * Copies a file from a specified source to a destination directory.
     * Handles file path resolution and ensures the destination directory exists.
     * 
     * @param srcFile - The path of the source file to be copied.
     * @param destDir - The destination directory where the file should be placed.
     * @returns A Promise that resolves when the file has been successfully copied.
     * @throws {Error} If the file cannot be copied, including due to permission errors or the source file not existing.
     */
    private async copyFileToDirectory(srcFile: string, destDir: string): Promise<void> {
        try {
            // Ensure the destination directory exists
            await this.ensureDirectoryExists(destDir);

            // Resolve the destination file path
            const fileName = path.basename(srcFile);
            const destFilePath = path.join(destDir, fileName);

            // Copy the file
            await fs.promises.copyFile(srcFile, destFilePath);
        } catch (error) {
            this.logError(`Error copying file: ${error}`);
            throw error;
        }
    }

    /**
     * Ensures that the given directory exists, creating it if it does not.
     * @param dirPath - The path of the directory to check and create.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error instanceof Error) {
                const nodeError = error as NodeJS.ErrnoException;
                if (nodeError.code !== 'EEXIST') {
                    throw nodeError;
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return 'Copies a file from a source location to a destination directory, ensuring directories exist and handling errors gracefully.';
    }
}
