// class/FontGenerator.ts


// ============================================================================
// Import
// ============================================================================

import {
    generateFonts,
    // FontAssetType,
    // OtherAssetType,
    RunnerOptions,
    // RunnerOptionalOptions,
} from "fantasticon";
import fantasticonConfig from "../config/fantasticon.config.js"


// ============================================================================
// Classes
// ============================================================================

/**
 * Handles the generation of font files from SVG icons or other vector graphic
 * formats. This class utilizes the "fantasticon" library to convert a
 * directory of SVG files into various font formats. Users can customize the
 * font generation process via configuration options.
 */
class FontGenerator {

    // Parameters
    // ========================================================================

    /**
     *  Configuration for the TypeScript compiler.
     */
    //  private config: any;
     private config: RunnerOptions;

    /**
     * Default configuration derived from an external configuration file.
     */
    //  private static defaultConfig: any = fantasticonConfig;
     private static defaultConfig: RunnerOptions = fantasticonConfig;
 

    // Constructor
    // ========================================================================

    /**
     * Constructs an instance of FontGenerator, merging default configuration
     * with optional custom settings.
     * 
     * @param {RunnerOptions} customConfig Optional custom configuration to
     * override the defaults.
     */
    constructor(
        // customConfig: any = {},
        customConfig: Partial<RunnerOptions> = {},
    ) {
         this.config = {
             ...FontGenerator.defaultConfig,
             ...customConfig
         };
     }


    // Methods
    // ========================================================================

    /**
     * Generates font assets from SVG icons located in the specified source
     * directory, and outputs them to the specified output directory.
     * 
     * @param {string} sourceDirectory The directory containing SVG files to
     * be converted.
     * @param {string} outputDirectory The directory where the generated font
     * files will be stored.
     * @param {Partial<RunnerOptions>} options Additional options to customize
     * the font generation process.
     */
    async generateFonts(
        sourceDirectory: string,
        outputDiectory: string,
        options?: {},
    ) {

        const config: RunnerOptions = {
            ...this.config,
            // RunnerMandatoryOptions
            inputDir: sourceDirectory, // (required)
            outputDir: outputDiectory, // (required)

            ...options
        };

        try {
            await generateFonts(config);
            console.log("Fonts generated successfully.");
        } catch (error) {
            console.error("Error generating fonts:", error);
        }

    }
}


// ============================================================================
// Export
// ============================================================================

export default FontGenerator;


// ============================================================================
// Example
// ============================================================================

// import FontGenerator from "./FontGenerator";

// const fontGenerator = new FontGenerator();
// const sourceDirectory = "./path/to/svg/icons";
// const outputDirectory = "./path/to/output/fonts";

// fontGenerator.generateFonts(sourceDirectory, outputDirectory)
//     .then(() => console.log("Font generation completed successfully."))
//     .catch(error => console.error("Failed to generate fonts:", error));