/**
 * A class for generating SVG sprites from individual SVG files.
 */
declare class SvgSpriteGenerator {
    private config;
    /**
     * Constructs an instance of SvgSpriteGenerator with the provided configuration.
     * @param {any} config - Configuration object for svg-sprite.
     */
    constructor(config: any);
    /**
     * Generates an SVG sprite from SVG files in a specified directory.
     * @param {string} sourceDir - Directory containing source SVG files.
     * @param {string} outputDir - Directory where the generated sprite will be saved.
     */
    generateSprite(sourceDir: string, outputDir: string): Promise<void>;
}
export default SvgSpriteGenerator;
