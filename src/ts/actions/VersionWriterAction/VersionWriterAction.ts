// ============================================================================
// Import
// ============================================================================

import { promises as fs } from "fs";
import { Action } from "../../core/Action";
import { ActionOptionsType } from "../../types";


// ============================================================================
// Classes
// ============================================================================

/**
 * VersionWriteAction is a step action responsible for writing a version
 * string to a specified file. This is commonly used for managing and tracking
 * software version releases.
 */
class VersionWriteAction extends Action {

    /**
     * Executes the version writing action.
     * @param options - The options specific to version writing, including the
     * file path and version string.
     * @returns A Promise that resolves when the version has been successfully
     * written to the file, or rejects with an error if the action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const filePath = options.filePath as string;
        const version = options.version as string;

        if (!filePath || !version) {
            throw new Error(
                "Missing required options: filePath or version."
            );
        }

        this.log(`Writing version ${version} to file: ${filePath}`);

        try {
            await this.writeVersionToFile(filePath, version);
            this.log(
                `Version ${version} written successfully to ${filePath}`
            );
        } catch (error) {
            this.logError(
                `Error writing version to file ${filePath}: ${error}`
            );
            throw error;
        }
    }

    /**
     * Writes a version string to a specified file path. This method is
     * asynchronous and uses Node.js"s filesystem promises to handle the file
     * writing operation.
     * 
     * @param filePath - The file path where the version information should
     * be written.
     * @param version - The version string to be written to the file.
     * @returns A promise that resolves when the version has been successfully
     * written.
     * @throws {Error} Throws an error if the file writing operation fails.
     */
    private async writeVersionToFile(
        filePath: string,
        version: string
    ): Promise<void> {
        try {
            await fs.writeFile(filePath, version, "utf8");
            this.log(
                `Version ${version} written to ${filePath}`
            );
        } catch (error) {
            throw new Error(
                `Error writing version to file ${filePath}: ${error}`
            );
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Writes a version string to a specified file, commonly used for managing and tracking software version releases.";
    }

}


// ============================================================================
// Export
// ============================================================================

export default VersionWriteAction;
