// ============================================================================
// Import
// ============================================================================

import path from "path";
import fs from "fs/promises";
import packageConfig from "../../config/package.config.js";
import { Action } from "../../core/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType.js";


// ============================================================================
// Classes
// ============================================================================

/**
 * PackageManagerAction is a step action that handles reading, validating,
 * and creating `package.json` files, supporting custom configurations and
 * merging with default settings.
 */
export class PackageManagerAction extends Action {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Executes the package management action.
     * @param options - The options specific to package management, including
     * paths and custom configurations.
     * @returns A Promise that resolves when the package.json file has been
     * read or created successfully.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const packageJsonPath = options.packageJsonPath as string;
        const outputDir = options.outputDir as string;
        const customConfig = options.customConfig || {};

        if (!packageJsonPath && !outputDir) {
            throw new Error(
                "Either packageJsonPath or outputDir must be specified."
            );
        }

        if (packageJsonPath) {
            await this.readPackageJson(packageJsonPath);
        }

        if (outputDir) {
            await this.createPackageJson(outputDir, customConfig);
        }
    }

    /**
     * Reads and parses the package.json file located at the specified path.
     * Handles errors gracefully, providing specific messages for file not
     * found, JSON parsing errors, or other unexpected errors.
     * 
     * @param packageJsonPath - The path to the package.json file.
     * @returns A promise that resolves to the parsed JSON object from the
     * package.json file.
     * @throws {Error} Throws an error if the file cannot be read or if the
     * content is not valid JSON.
     */
    private async readPackageJson(
        packageJsonPath: string
    ): Promise<Record<string, unknown>> {
        const fullPath = path.resolve(packageJsonPath);

        try {
            const fileContent = await fs.readFile(fullPath, "utf-8");
            const parsedContent = JSON.parse(fileContent);
            this.log(`Successfully read package.json from ${fullPath}`);
            return parsedContent;
        } catch (error: any) {
            if (error.code === "ENOENT") {
                throw new Error(
                    `File not found at ${fullPath}. Please ensure the path is correct.`
                );
            } else if (error.name === "SyntaxError") {
                throw new Error(
                    `Failed to parse JSON from ${fullPath}: ${error.message}`
                );
            } else {
                throw new Error(
                    `An unexpected error occurred while reading ${fullPath}: ${error.message}`
                );
            }
        }
    }

    /**
     * Creates a package.json file with the merged configuration in the 
     * specified directory.
     * 
     * @param outputDir - The directory where the package.json will be created.
     * @param customConfig - Custom settings to override or augment the
     * default package configuration.
     * @returns A promise that resolves when the file has been successfully
     * written.
     * @throws {Error} Throws an error if the directory cannot be created or
     * the file cannot be written.
     */
    private async createPackageJson(
        outputDir: string,
        customConfig: Record<string, any>
    ): Promise<void> {

        const filePath = path.join(outputDir, "package.json");

        // Merge custom configuration with default configuration
        const config = {
            ...packageConfig,
            ...customConfig
        };

        const data = JSON.stringify(config, null, 2);

        try {
            // Ensure the output directory exists
            await this.ensureDirectoryExists(outputDir);

            // Write the package.json file
            await fs.writeFile(filePath, data, "utf-8");
            this.log(`package.json created at ${filePath}`);
        } catch (error) {
            this.logError(`Error creating package.json: ${error}`);
            throw error;
        }
    }

    /**
     * Ensures that the specified directory exists, creating it if it does not.
     * 
     * @param dirPath - The path of the directory to verify or create.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (
                error instanceof Error && (error as NodeJS.ErrnoException).code !== "EEXIST"
            ) {
                throw error;
            }
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Manages package.json files by reading existing configurations or creating new ones with merged settings.";
    }
}


// ============================================================================
// Export
// ============================================================================

// export default PackageManagerAction;
