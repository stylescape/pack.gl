// ============================================================================
// Imports
// ============================================================================

import * as fs from "fs/promises";
import * as glob from "glob";
import * as path from "path";
import SVGO, { loadConfig } from "svgo";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Classes
// ============================================================================

/**
 * SvgPackagerAction is responsible for optimizing and packaging SVG files.
 * It reads SVG files from a specified directory, optimizes them using SVGO,
 * and then outputs them as TypeScript files and JSON indexes.
 */
export class SvgPackagerAction extends Action {
    // Methods
    // ========================================================================

    /**
     * Executes the SVG processing action.
     * @param options - The options specifying input and output directories.
     * @returns A Promise that resolves when the action completes successfully.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const {
            svgoConfigPath = "./config/svgo.config.js",
            inputDirectory = "src/icons",
            outputDirectory = "dist/icons",
            tsOutputDirectory = "dist/ts",
            jsonOutputDirectory = "dist",
        } = options;

        this.logInfo(`Processing SVG files from ${inputDirectory}...`);
        const iconNames: string[] = [];

        try {
            const svgFiles = glob.sync(`${inputDirectory}/**/*.svg`);

            for (const file of svgFiles) {
                const iconName = this.sanitizeFileName(
                    path.basename(file, ".svg"),
                );
                iconNames.push(iconName);

                const svgContent = await this.readSvgFile(file);
                const optimizedSvg = await this.optimizeSvg(
                    svgoConfigPath,
                    svgContent,
                );

                await this.writeFiles(
                    iconName,
                    optimizedSvg,
                    outputDirectory,
                    tsOutputDirectory,
                );
            }

            await this.writeIconsJson(iconNames, jsonOutputDirectory);
            this.logInfo(
                `Successfully processed ${svgFiles.length} SVG files.`,
            );
        } catch (error) {
            this.logError("Error processing SVG files.", error);
            throw error;
        }
    }

    /**
     * Reads the content of an SVG file.
     * @param filePath The path to the SVG file.
     * @returns The content of the SVG file.
     */
    private async readSvgFile(filePath: string): Promise<string> {
        return fs.readFile(filePath, "utf8");
    }

    /**
     * Sanitizes a file name to be a valid TypeScript identifier.
     * @param fileName The original file name.
     * @returns A sanitized version of the file name.
     */
    private sanitizeFileName(fileName: string): string {
        return fileName.replace(/[^a-zA-Z0-9_]/g, "_");
    }

    /**
     * Optimizes SVG content using SVGO.
     * @param svgoConfigPath Path to the SVGO configuration file.
     * @param svgContent The raw SVG content.
     * @returns The optimized SVG content.
     */
    private async optimizeSvg(
        svgoConfigPath: string,
        svgContent: string,
    ): Promise<string> {
        const config = await loadConfig(svgoConfigPath);
        const result = await SVGO.optimize(svgContent, { ...config });
        return result.data.trim();
    }

    /**
     * Writes optimized SVG content to files (SVG & TypeScript).
     * @param iconName The name of the icon.
     * @param svgContent The optimized SVG content.
     * @param outputDirectory The directory for SVG output.
     * @param tsOutputDirectory The directory for TypeScript output.
     */
    private async writeFiles(
        iconName: string,
        svgContent: string,
        outputDirectory: string,
        tsOutputDirectory: string,
    ): Promise<void> {
        await this.writeSvgFile(iconName, svgContent, outputDirectory);
        await this.writeTypeScriptFile(
            iconName,
            svgContent,
            tsOutputDirectory,
        );
    }

    /**
     * Writes the optimized SVG content to an output file.
     * @param iconName The name of the icon.
     * @param svgContent The SVG content to be written.
     * @param outputDirectory The directory to output the SVG file.
     */
    private async writeSvgFile(
        iconName: string,
        svgContent: string,
        outputDirectory: string,
    ): Promise<void> {
        const outputPath = path.join(outputDirectory, `${iconName}.svg`);
        await fs.writeFile(outputPath, svgContent);
    }

    /**
     * Creates a TypeScript file from the optimized SVG content.
     * @param iconName The name of the icon.
     * @param svgContent The optimized SVG content.
     * @param tsOutputDirectory The directory for TypeScript output.
     */
    private async writeTypeScriptFile(
        iconName: string,
        svgContent: string,
        tsOutputDirectory: string,
    ): Promise<void> {
        const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
        const outputPath = path.join(tsOutputDirectory, `${iconName}.ts`);
        await fs.writeFile(outputPath, tsContent);
    }

    /**
     * Writes a JSON file containing the names of processed icons.
     * @param iconNames An array of processed icon names.
     * @param jsonOutputDirectory The directory to output the JSON file.
     */
    private async writeIconsJson(
        iconNames: string[],
        jsonOutputDirectory: string,
    ): Promise<void> {
        const jsonContent = JSON.stringify(iconNames, null, 2);
        const outputPath = path.join(jsonOutputDirectory, "icons.json");
        await fs.writeFile(outputPath, jsonContent);
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Optimizes and packages SVG files into multiple formats (SVG, TypeScript, JSON).";
    }
}

// ============================================================================
// Export
// ============================================================================

export default SvgPackagerAction;
