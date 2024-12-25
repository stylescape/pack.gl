// ============================================================================
// Import
// ============================================================================

import path from "path";
import fs from "fs/promises";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType.js";
import packageConfig from "./package.config.js";


// ============================================================================
// Classes
// ============================================================================

/**
 * PackageManagerAction handles reading, validating, and creating `package.json`
 * files, supporting custom configurations and merging with default settings.
 */
export class PackageManagerAction extends Action {
    /**
     * Executes the package management action.
     * Reads or creates a `package.json` file based on the provided options.
     *
     * @param options - The options specific to package management, including
     * `packageJsonPath`, `outputDir`, and `customConfig`.
     * @returns A Promise that resolves when the action is completed successfully.
     * @throws {Error} Throws an error if neither `packageJsonPath` nor `outputDir` is provided.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { packageJsonPath, outputDir, customConfig = {} } = options;

        if (!packageJsonPath && !outputDir) {
            throw new Error(
                "Either 'packageJsonPath' or 'outputDir' must be specified."
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
     * Reads and parses the `package.json` file located at the specified path.
     *
     * @param packageJsonPath - The path to the `package.json` file.
     * @returns A Promise that resolves to the parsed JSON object from the file.
     * @throws {Error} Throws an error if the file cannot be found or the content is not valid JSON.
     */
    private async readPackageJson(packageJsonPath: string): Promise<Record<string, unknown>> {
        const fullPath = path.resolve(packageJsonPath);

        try {
            const fileContent = await fs.readFile(fullPath, "utf-8");
            const parsedContent = JSON.parse(fileContent);
            this.logInfo(`Successfully read package.json from ${fullPath}`);
            return parsedContent;
        } catch (error: any) {
            if (error.code === "ENOENT") {
                throw new Error(`File not found at ${fullPath}. Please ensure the path is correct.`);
            } else if (error.name === "SyntaxError") {
                throw new Error(`Invalid JSON in ${fullPath}: ${error.message}`);
            } else {
                throw new Error(`Unexpected error while reading ${fullPath}: ${error.message}`);
            }
        }
    }

    /**
     * Creates a `package.json` file with merged configuration in the specified directory.
     *
     * @param outputDir - The directory where the `package.json` will be created.
     * @param customConfig - Custom settings to override or augment the default configuration.
     * @returns A Promise that resolves when the file has been successfully created.
     * @throws {Error} Throws an error if the directory cannot be created or the file cannot be written.
     */
    private async createPackageJson(outputDir: string, customConfig: Record<string, any>): Promise<void> {
        const filePath = path.join(outputDir, "package.json");
        const config = { ...packageConfig, ...customConfig };
        const data = JSON.stringify(config, null, 2);

        try {
            await this.ensureDirectoryExists(outputDir);
            await fs.writeFile(filePath, data, "utf-8");
            this.logInfo(`package.json successfully created at ${filePath}`);
        } catch (error) {
            this.logError("Error creating package.json", error);
            throw error;
        }
    }

    /**
     * Ensures that the specified directory exists, creating it if it does not.
     *
     * @param dirPath - The path of the directory to verify or create.
     * @returns A Promise that resolves once the directory is verified or created.
     * @throws {Error} Throws an error if the directory cannot be created.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
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
        return "Manages package.json files by reading existing configurations or creating new ones with merged settings.";
    }
}

// ============================================================================
// Export
// ============================================================================

// export default PackageManagerAction;