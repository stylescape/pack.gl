import { RunnerOptions } from "fantasticon";
/**
 * Handles the generation of font files from SVG icons or other vector graphic
 * formats. This class utilizes the "fantasticon" library to convert a
 * directory of SVG files into various font formats. Users can customize the
 * font generation process via configuration options.
 */
declare class FontGenerator {
    /**
     *  Configuration for the TypeScript compiler.
     */
    private config;
    /**
     * Default configuration derived from an external configuration file.
     */
    private static defaultConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    /**
     * Constructs an instance of FontGenerator, merging default configuration with optional custom settings.
     *
     * @param {RunnerOptions} customConfig Optional custom configuration to override the defaults.
     */
    constructor(customConfig?: Partial<RunnerOptions>);
    /**
     * Generates font assets from SVG icons located in the specified source directory,
     * and outputs them to the specified output directory.
     *
     * @param {string} sourceDirectory The directory containing SVG files to be converted.
     * @param {string} outputDirectory The directory where the generated font files will be stored.
     * @param {Partial<RunnerOptions>} options Additional options to customize the font generation process.
     */
    generateFonts(sourceDirectory: string, outputDiectory: string, options?: {}): Promise<void>;
}
export default FontGenerator;
