// ============================================================================
// Import
// ============================================================================

import { promises as fs } from "fs";
import path from "path";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types";


// ============================================================================
// Classes
// ============================================================================

/**
 * VersionWriteAction is a step action responsible for replacing a version
 * string in one or more specified files. The version is located and replaced
 * based on a specified key and pattern.
 */
export class VersionWriteAction extends Action {

    // Methods
    // ========================================================================

    /**
     * Executes the version writing action.
     * @param options - The options specific to version writing, including the
     * files, key, and version string or a flag to retrieve it from
     * `package.json`.
     * @returns A Promise that resolves when the version has been successfully
     * replaced in all specified files, or rejects with an error if the
     * action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const files = options.files as
            | { path: string; key?: string }[]
            | undefined;
        let version = options.version as string | undefined;

        if (!files) {
            throw new Error(`Missing required option: files.`);
        }

        // Retrieve version from package.json if not explicitly provided
        if (!version) {
            version = await this.getVersionFromPackageJson();
            if (!version) {
                throw new Error(
                    `Version is not provided in options and could not be retrieved from package.json.`,
                );
            }
        }

        this.logInfo(`Replacing version "${version}" in specified files.`);

        try {
            // Replace the version in each file
            await Promise.all(
                files.map(({ path: filePath, key }) =>
                    this.replaceVersionInFile(
                        filePath,
                        version!,
                        key || "version:",
                    ),
                ),
            );
            this.logInfo(
                `Version "${version}" replaced successfully in all specified files.`,
            );
        } catch (error) {
            this.logError(
                `Failed to replace version in one or more files.`,
                error,
            );
            throw error;
        }
    }

    /**
     * Retrieves the version string from the `package.json` file.
     * @returns A promise that resolves to the version string or `undefined`
     * if not found.
     * @throws {Error} Throws an error if `package.json` cannot be read.
     */
    private async getVersionFromPackageJson(): Promise<string | undefined> {
        try {
            const packageJsonPath = path.resolve(
                process.cwd(),
                "package.json",
            );
            const packageJsonContent = await fs.readFile(
                packageJsonPath,
                "utf8",
            );
            const packageJson = JSON.parse(packageJsonContent);
            const version = packageJson.version;

            if (version && /^\d+\.\d+\.\d+$/.test(version)) {
                this.logInfo(
                    `Version "${version}" retrieved from package.json.`,
                );
                return version;
            } else {
                this.logWarn(`Invalid or missing version in package.json.`);
                return undefined;
            }
        } catch (error) {
            this.logError(
                `Error reading package.json for version retrieval.`,
                error,
            );
            return undefined;
        }
    }

    /**
     * Replaces a version string in a file for a specific key.
     * This method reads the file, replaces the version for the key, and
     * writes the updated content back to the file.
     *
     * @param filePath - The file path where the version should be replaced.
     * @param version - The new version string to replace in the file.
     * @param key - The key prefix that identifies the version line (e.g.,
     * `version:`).
     * @returns A promise that resolves when the version has been successfully
     * replaced.
     * @throws {Error} Throws an error if reading or writing the file fails.
     */
    private async replaceVersionInFile(
        filePath: string,
        version: string,
        key: string,
    ): Promise<void> {
        try {
            const content = await fs.readFile(filePath, "utf8");
            const lines = content.split("\n");

            const updatedLines = lines.map((line) => {
                const regex = new RegExp(`^\\s*${key}\\s*\\d+\\.\\d+\\.\\d+`);
                if (regex.test(line)) {
                    return line.replace(/\d+\.\d+\.\d+$/, version);
                }
                return line;
            });

            await fs.writeFile(filePath, updatedLines.join("\n"), "utf8");
            this.logInfo(
                `Version replaced in file "${filePath}" for key "${key}".`,
            );
        } catch (error) {
            throw new Error(
                `Error replacing version in file "${filePath}":
                ${(error as Error).message}`,
            );
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        let description = `
            Replaces a version string in one or more specified files based on
            a key and pattern. Can retrieve the version from package.json or
            set it manually.
            `;
        return description;
    }
}


// ============================================================================
// Export
// ============================================================================

// export default VersionWriteAction;
