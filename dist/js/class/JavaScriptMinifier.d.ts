/**
 * Class to minify JavaScript files using Terser.
 */
declare class JavaScriptMinifier {
    private config;
    /**
     * Constructs an instance with the provided configuration.
     * @param {any} config - Configuration object - minification options for Terser.
     */
    constructor(config: any);
    /**
     * Minifies a JavaScript file.
     * @param {string} inputPath - Path to the input JavaScript file.
     * @param {string} outputPath - Path to save the minified output file.
     * @returns {Promise<void>} - A promise that resolves when minification is complete.
     */
    minifyFile(inputPath: string, outputPath: string): Promise<void>;
}
export default JavaScriptMinifier;
