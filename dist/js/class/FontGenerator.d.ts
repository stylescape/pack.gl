declare class FontGenerator {
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
    constructor(customConfig?: any);
    generateFonts(sourceDirectory: string, outputDiectory: string): Promise<void>;
}
export default FontGenerator;
