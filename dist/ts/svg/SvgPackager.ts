// ============================================================================
// Import
// ============================================================================

import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';
import SVGO from 'svgo';
import { loadConfig } from 'svgo';


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality to optimize and package SVG files into various
 * formats. It reads SVG files from a specified directory, optimizes them
 * using SVGO, and then outputs them as TypeScript files and JSON indexes.
 */
class SvgPackager {

    /**
     * Constructor for SvgPackager class.
     * Optionally accepts configurations or dependencies.
     */
    constructor(private svgoConfigPath: string) {}

    /**
     * Processes all SVG files in a given directory.
     * @param inputDirectory The directory containing SVG files to process.
     * @param outputDirectory The directory where optimized SVGs will be output.
     * @param tsOutputDirectory The directory where TypeScript files will be saved.
     * @param jsonOutputDirectory The directory where a JSON index of icons will be saved.
     */
    public async processSvgFiles(
        inputDirectory: string,
        outputDirectory: string,
        ts_output_directory: string,
        json_output_directory: string,
    ): Promise<void> {

        const iconNames: string[] = [];

        try {
            // console.log(`Processing directory: ${inputDirectory}`);

            const svgFiles = glob.sync(`${inputDirectory}/**/*.svg`);

            for (const file of svgFiles) {

                // console.log(`Processing file: ${file}`);
                const iconName = this.sanitizeFileName(
                    path.basename(file, '.svg')
                );
                iconNames.push(iconName);

                // console.log(`Processing icon: ${iconName}`);
                const svgContent = await this.readSvgFile(file);
                const optimizedSvg = await this.optimizeSvg(svgContent);
                // const optimizedSvg = await this.optimizeSvg(file, svgContent);

                // svgo will always add a final newline when in pretty mode
                const resultSvg = optimizedSvg.trim()

                // Write the optimized SVG file
                await this.writeSvgFile(
                    // file,
                    iconName,
                    resultSvg,
                    outputDirectory
                );

                // Write the optimized TypeScript file
                await this.writeTypeScriptFile(
                    // file,
                    iconName,
                    resultSvg,
                    ts_output_directory
                );

            }

            await this.writeIconsJson(
                iconNames,
                json_output_directory
            );
            console.log(
                `Successfully processed ${svgFiles.length} SVG files.`
            );

        } catch (error) {
            console.error("Error processing SVG files:", error);
            throw error;
        }
    }

    /**
     * Reads the content of an SVG file.
     * @param filePath The path to the SVG file.
     * @returns The content of the SVG file.
     */
    // private async readSvgFile(filePath: string): Promise<string> {
    //     try {
    //         const absolutePath = path.resolve(filePath);
    //         const svgContent = await fs.readFile(absolutePath, 'utf8');
    //         return svgContent;
    //     } catch (error) {
    //         console.error('Error reading file:', filePath, error);
    //         throw error;
    //     }
    // }
    private async readSvgFile(
        filePath: string
    ): Promise<string> {
        return fs.readFile(filePath, "utf8");
    }

    /**
     * Sanitizes a file name to be a valid TypeScript identifier.
     * @param fileName The original file name.
     * @returns A sanitized version of the file name.
     */
    // private sanitizeFileName(fileName: string): string {
    //         // Implement more robust sanitization logic if necessary
    //         return fileName.replace(/[^a-zA-Z0-9_]/g, '_');
    // }
    private sanitizeFileName(fileName: string): string {
        return fileName.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    private async writeFiles(
        iconName: string,
        svgContent: string,
        outputDirectory: string
    ): Promise<void> {
        await this.writeSvgFile(
            iconName,
            svgContent,
            outputDirectory
        );
        await this.writeTypeScriptFile(
            iconName,
            svgContent,
            outputDirectory
        );
    }

    /**
     * Optimizes SVG content using SVGO.
     * @param svgContent The raw SVG content.
     * @returns The optimized SVG content.
     */
    // private async optimizeSvg(
    //     filePath: string,
    //     svgContent: string
    // ): Promise<string> {

    //     try {
            
    //         const config = await loadConfig(
    //             path.join(__dirname, '../config/svgo.config.js')
    //         )

    //         const result = await SVGO.optimize(
    //             svgContent,
    //             { path: filePath, ...config } // Add SVGO options if needed
    //         );

    //         return result.data;
    //     } catch (error) {
    //         console.error('Error optimizing SVG:', error);
    //         throw error;
    //     }
    // }
    private async optimizeSvg(svgContent: string): Promise<string> {
        const config = await loadConfig(this.svgoConfigPath);
        const result = await SVGO.optimize(svgContent, { ...config });
        return result.data.trim();
    }

    /**
     * Creates a TypeScript file from SVG content.
     * @param filePath The path of the SVG file.
     * @param svgContent The optimized SVG content.
     * @param outputDirectory The directory to output the TypeScript file.
     */
    //  private async writeTypeScriptFile(
    //     filePath: string,
    //     iconName: string,
    //     svgContent: string,
    //     outputDirectory: string
    // ): Promise<void> {
    //     try {
    //         const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
    //         const outputPath = path.join(outputDirectory, `${iconName}.ts`);
    //         await fs.writeFile(outputPath, tsContent);
    //     } catch (error) {
    //         console.error(`Error creating TypeScript file for ${filePath}:`, error);
    //         throw error;
    //     }
    // }

    private async writeTypeScriptFile(
        iconName: string,
        svgContent: string,
        outputDirectory: string
    ): Promise<void> {
        const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
        const outputPath = path.join(outputDirectory, `${iconName}.ts`);
        await fs.writeFile(outputPath, tsContent);
    }

    /**
     * Writes the SVG content to a file.
     * 
     * @param filePath The original file path of the SVG.
     * @param svgContent The SVG content to be written.
     * @param outputDirectory The directory to output the SVG file.
     */
    // private async writeSvgFile(
    //     filePath: string,
    //     iconName: string,
    //     svgContent: string,
    //     outputDirectory: string
    // ): Promise<void> {
    //     try {
    //         const outputPath = path.join(outputDirectory, `${iconName}.svg`);
    //         await fs_extra.outputFile(outputPath, svgContent);
    //         console.log(`SVG file written successfully for ${iconName}`);
    //     } catch (error) {
    //         console.error(`Error writing SVG file for ${iconName}:`, error);
    //         throw error;
    //     }
    // }
    private async writeSvgFile(
        iconName: string,
        svgContent: string,
        outputDirectory: string
    ): Promise<void> {
        const outputPath = path.join(outputDirectory, `${iconName}.svg`);
        await fs.writeFile(outputPath, svgContent);
    }

    /**
     * Writes a JSON file containing the names of processed icons.
     * This method creates a JSON file that lists all icon names which have
     * been processed, making it easier to reference or index these icons in
     * other parts of an application.
     * 
     * @param iconNames An array of strings containing the names of the icons.
     * @param outputDirectory The directory where the JSON file will be saved.
     */
    private async writeIconsJson(
        iconNames: string[],
        outputDirectory: string
    ): Promise<void> {

        try {
            const jsonContent = JSON.stringify(iconNames, null, 2);
            const outputPath = path.join(outputDirectory, "icons.json");
            // await fs_extra.outputFile(outputPath, jsonContent);
            await fs.writeFile(outputPath, jsonContent);
            console.log(
                "Icons JSON file created successfully"
            );
        } catch (error) {
            console.error(
                "Error writing icons JSON file:",
                error
            );
            throw error;
        }
    }
    
}


// ============================================================================
// Export
// ============================================================================

export default SvgPackager;


// ============================================================================
// Example
// ============================================================================

// import SvgPackager from './SvgPackager';

// const packager = new SvgPackager('./config/svgo.config.js');
// packager.processSvgFiles('./src/icons', './dist/icons', './dist/ts', './dist')
//     .then(() => console.log('SVG packaging completed.'))
//     .catch(error => console.error('Error packaging SVGs:', error));
