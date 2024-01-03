/**
 * Class to minify JavaScript files using Terser.
 */
declare class JavaScriptMinifier {
    /**
     *  Configuration for the JavaScript compiler.
     */
    private config;
    /**
     * Default configuration for the JavaScript compiler.
     */
    private static defaultConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {any} customConfig - OptionalConfiguration object - minification options for Terser.
     */
    constructor(customConfig?: any);
    /**
     * Minifies a JavaScript file.
     * @param {string} inputPath - Path to the input JavaScript file.
     * @param {string} outputPath - Path to save the minified output file.
     * @returns {Promise<void>} - A promise that resolves when minification is complete.
     */
    minifyFile(inputPath: string, outputPath: string): Promise<void>;
}
export default JavaScriptMinifier;
