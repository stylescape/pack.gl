import { Action } from '../../core/Action';
import { ActionOptionsType } from '../../types/ActionOptionsType';
import path from 'path';
import fs from 'fs';

/**
 * DirectoryCleanAction is a step action responsible for cleaning a directory
 * by recursively deleting all its contents, including files and
 * subdirectories.
 */
export class DirectoryCleanAction extends Action {

    /**
     * Executes the directory cleaning action.
     * @param options - The options specific to directory cleaning, including the directory path.
     * @returns A Promise that resolves when the directory has been successfully cleaned, or rejects with an error if the action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const dirPath = options.dirPath as string;

        if (!dirPath) {
            throw new Error('Missing required option: dirPath.');
        }

        this.log(`Cleaning directory: ${dirPath}`);

        try {
            await this.cleanDirectory(dirPath);
            this.log(`Directory cleaned successfully: ${dirPath}`);
        } catch (error) {
            this.logError(`Error cleaning directory ${dirPath}: ${error}`);
            throw error;
        }
    }

    /**
     * Recursively deletes all contents of a specified directory, including all
     * subdirectories and files.
     * If the directory does not exist, the method does nothing.
     * 
     * @param dirPath - The path to the directory to be cleaned.
     * @returns A Promise that resolves when the directory has been successfully cleaned.
     * @throws {Error} Throws an error if deleting any file or directory fails.
     */
    private async cleanDirectory(dirPath: string): Promise<void> {
        if (fs.existsSync(dirPath)) {
            for (const file of fs.readdirSync(dirPath)) {
                const curPath = path.join(dirPath, file);

                if (fs.lstatSync(curPath).isDirectory()) {
                    // Recursively clean subdirectory
                    await this.cleanDirectory(curPath);
                } else {
                    // Delete file
                    await fs.promises.unlink(curPath);
                }
            }

            // Remove the directory itself
            await fs.promises.rmdir(dirPath);
        } else {
            this.log(`Directory does not exist: ${dirPath}`);
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return 'Cleans a directory by recursively deleting all its contents, including files and subdirectories.';
    }
}
