/**
 * Facilitates the minification of JavaScript files using the Terser library.
 * This class allows for flexible configuration of minification settings and
 * aims to produce optimized output files that are significantly reduced in
 * size.
 */
declare class JavaScriptMinifier {
    /**
     * Configuration for the Terser minification process.
     */
    private config;
    /**
     * Default configuration for the Terser minification, loaded from an
     * external configuration file.
     */
    private static defaultConfig;
    /**
     * Constructs an instance with merged configuration of default and
     * optionally provided custom settings.
     *
     * @param {any} customConfig Optional. Custom configuration object to
     * override or extend the default Terser options.
     */
    constructor(customConfig?: any);
    /**
     * Minifies a JavaScript file using the configured Terser settings.
     *
     * @param {string} inputPath Path to the input JavaScript file.
     * @param {string} outputPath Path where the minified file will be saved.
     * @returns {Promise<void>} A promise that resolves when the minification
     * process is complete, or rejects with an error.
     * @throws {Error} An error is thrown if there are issues reading the
     * input file, the minification fails, or the output file cannot be written.
     */
    minifyFile(inputPath: string, outputPath: string): Promise<void>;
}
export default JavaScriptMinifier;
