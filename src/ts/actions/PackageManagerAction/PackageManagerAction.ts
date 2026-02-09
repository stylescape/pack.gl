// ============================================================================
// Import
// ============================================================================

import fs from "fs/promises";
import path from "path";
import { Action } from "../../core/pipeline/Action.js";
import type { ActionOptionsType } from "../../types/ActionOptionsType.js";
import packageConfig from "./package.config.js";

// ============================================================================
// Classes
// ============================================================================

/**
 * PackageManagerAction handles reading, validating, and creating `package.json`
 * files, supporting custom configurations and merging with selected fields.
 */
export class PackageManagerAction extends Action {
    /**
     * Executes the package management action.
     * Reads an existing `package.json`, extracts selected fields, and writes a new one.
     *
     * @param options - Options specifying input path, output directory, and fields to export.
     * @returns A Promise that resolves when the action is completed successfully.
     * @throws {Error} Throws an error if neither `packageJsonPath` nor `outputDir` is provided.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const {
            packageJsonPath,
            outputDir,
            fields = [], // Specify which fields to copy
            customConfig = {},
        } = options;

        if (!packageJsonPath) {
            throw new Error("The 'packageJsonPath' option is required.");
        }
        if (!outputDir) {
            throw new Error("The 'outputDir' option is required.");
        }

        const existingConfig = await this.readPackageJson(packageJsonPath);
        const filteredConfig = this.filterFields(existingConfig, fields);

        await this.createPackageJson(outputDir, filteredConfig, customConfig);
    }

    /**
     * Reads and parses an existing `package.json`.
     *
     * @param packageJsonPath - Path to the `package.json` file.
     * @returns Parsed JSON object.
     * @throws {Error} If the file does not exist or contains invalid JSON.
     */
    private async readPackageJson(
        packageJsonPath: string,
    ): Promise<Record<string, unknown>> {
        const fullPath = path.resolve(packageJsonPath);

        try {
            const fileContent = await fs.readFile(fullPath, "utf-8");
            const parsedContent = JSON.parse(fileContent);
            this.logInfo(`Successfully read package.json from ${fullPath}`);
            return parsedContent;
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === "ENOENT") {
                throw new Error(
                    `File not found at ${fullPath}. Please ensure the path is correct.`,
                );
            } else if (err.name === "SyntaxError") {
                throw new Error(`Invalid JSON in ${fullPath}: ${err.message}`);
            } else {
                throw new Error(
                    `Unexpected error while reading ${fullPath}: ${err.message ?? String(error)}`,
                );
            }
        }
    }

    /**
     * Filters specified fields from a `package.json` object.
     *
     * @param config - The original package.json object.
     * @param fields - List of fields to extract.
     * @returns A new object containing only the selected fields.
     */
    private filterFields(
        config: Record<string, unknown>,
        fields: string[],
    ): Record<string, unknown> {
        if (!fields.length) {
            return config; // If no fields are specified, return the full config.
        }

        const filteredConfig: Record<string, unknown> = {};
        for (const field of fields) {
            if (config[field] !== undefined) {
                filteredConfig[field] = config[field];
            }
        }

        this.logInfo(
            `Filtered package.json fields: ${JSON.stringify(filteredConfig, null, 2)}`,
        );
        return filteredConfig;
    }

    /**
     * Creates a `package.json` file with selected fields and custom overrides.
     *
     * @param outputDir - Directory where the new `package.json` will be created.
     * @param filteredConfig - The filtered package.json fields.
     * @param customConfig - Custom overrides to apply.
     * @returns A Promise that resolves when the file has been successfully created.
     * @throws {Error} If the file cannot be written.
     */
    private async createPackageJson(
        outputDir: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredConfig: Record<string, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customConfig: Record<string, any>,
    ): Promise<void> {
        const filePath = path.join(outputDir, "package.json");

        // Merge default settings with filtered config and custom overrides
        const finalConfig = {
            ...packageConfig,
            ...filteredConfig,
            ...customConfig,
        };
        const data = JSON.stringify(finalConfig, null, 2);

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
     * @throws {Error} If the directory cannot be created.
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
        return "Reads an existing package.json, extracts selected fields, and creates a new one.";
    }
}

// ============================================================================
// Export
// ============================================================================

// export default PackageManagerAction;
