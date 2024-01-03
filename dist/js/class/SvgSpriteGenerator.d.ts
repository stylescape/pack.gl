import svgSprite from 'svg-sprite';
/**
 * A class for generating SVG sprites from individual SVG files.
 */
declare class SvgSpriteGenerator {
    /**
     * Constructs an instance of SvgSpriteGenerator with the provided configuration.
     * @param {svgSprite.Config} config - Configuration object for svg-sprite.
     */
    /**
     *  Configuration for the TypeScript compiler.
     */
    private config;
    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    constructor(customConfig?: svgSprite.Config);
    /**
     * Generates an SVG sprite from SVG files in a specified directory.
     * @param {string} sourceDir - Directory containing source SVG files.
     * @param {string} outputDir - Directory where the generated sprite will be saved.
     */
    generateSprite(sourceDir: string, outputDir: string): Promise<void>;
}
export default SvgSpriteGenerator;
