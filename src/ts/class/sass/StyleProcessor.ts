// ============================================================================
// Import
// ============================================================================

import * as sass from "sass";
import postcss from "postcss";
import { promises as fs } from "fs";
import path from "path";
import { NodePackageImporter } from "sass"; // Update this path based on the actual source of NodePackageImporter

import postcssConfigExpanded from "../../config/postcss.config.expanded.js";
import postcssConfigCompressed from "../../config/postcss.config.compressed.js";


// ============================================================================
// Classes
// ============================================================================

/**
 * Class responsible for processing styles, including compiling SCSS and
 * applying PostCSS transformations. It can be configured to output either
 * expanded or compressed CSS, making it flexible for different environments.
 */
class StyleProcessor {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Processes the given CSS with PostCSS based on the provided style option.
     * @param css The CSS string to process.
     * @param styleOption The style option, either "expanded" or "compressed".
     * @returns Processed CSS string.
     */
    async processPostCSS(
        css: string,
        styleOption: "expanded" | "compressed"
    ) {
        const config = styleOption === "expanded" ? postcssConfigExpanded : postcssConfigCompressed;
        const result = await postcss(config.plugins).process(
            css,
            { from: undefined, map: { inline: false } }
        );
        return result.css;
    }

    /**
     * Ensures that the given directory exists. Creates it if it does not
     * exist.
     * @param dirPath The path of the directory to check and create.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error instanceof Error) {
                const nodeError = error as NodeJS.ErrnoException;
                if (nodeError.code !== "EEXIST") {
                    // Rethrow if it"s not a "directory exists" error
                    throw nodeError;
                }
            } else {
                // Rethrow if it"s not an Error instance
                throw error;
            }
        }
    }
    
    /**
     * Compiles SCSS to CSS and processes it using PostCSS.
     * @param inputFile Path to the input SCSS file.
     * @param outputFile Path to the output CSS file.
     * @param styleOption Style option for the output, either "expanded" or
     * "compressed".
     */
    async processStyles(
        inputFile: string,
        outputFile: string,
        styleOption: "expanded" | "compressed"
    ) {
        try {
            // Ensure the output directory exists
            const outputDir = path.dirname(outputFile);
            await this.ensureDirectoryExists(outputDir);

            // Compile SCSS to CSS
            const result = await sass.compileAsync(
                inputFile,
                { 
                    style: styleOption,
                    importers: [
                        new NodePackageImporter()
                    ],
                }
            );

            // Process the compiled CSS with PostCSS
            const processedCss = await this.processPostCSS(
                result.css,
                styleOption
            );

            // Write the processed CSS to a file
            await fs.writeFile(outputFile, processedCss, "utf-8");

            // Optionally handle source maps
            // ...

        } catch (err) {
            console.error(`Error processing styles from ${inputFile}:`, err);
            // Re-throw the error for further handling if necessary
            throw err;
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default StyleProcessor;


// ============================================================================
// Example
// ============================================================================

// import StyleProcessor from "./StyleProcessor";

// const styleProcessor = new StyleProcessor();
// const inputFile = "./src/styles/main.scss";
// const outputFile = "./dist/styles/main.css";

// styleProcessor.processStyles(inputFile, outputFile, "compressed")
//     .then(() => console.log("Styles processed successfully."))
//     .catch(error => console.error("Failed to process styles:", error));