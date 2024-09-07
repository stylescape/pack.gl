/**
 * Class designed for rendering and writing HTML or text files from Nunjucks
 * templates. It encapsulates configuration and rendering logic, making it
 * simple to produce files from templates for various uses such as email
 * templates, web pages, or configuration files.
 */
declare class TemplateWriter {
    context: Record<string, any>;
    /**
     *  Configuration for the Nunjucks writer compiler.
     */
    private config;
    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig;
    /**
     * Constructs a TemplateWriter instance with specified settings.
     * @param {string} templatesDir The directory containing Nunjucks templates.
     * @param {object} context Global data object that will be available to all templates.
     * @param {object} customConfig Custom configuration settings for Nunjucks.
     */
    constructor(templatesDir: string, context?: Record<string, any>, customConfig?: Record<string, any>);
    /**
     * Generates content from a Nunjucks template file.
     * @param {string} template The template file name.
     * @returns {Promise<string>} The rendered template as a string.
     * @throws {Error} If there is an error in rendering the template.
     */
    generateTemplate(template: string): Promise<string>;
    /**
     * Writes the rendered template content to a specified file path.
     * @param {string} template The template file name.
     * @param {string} outputFile The output file path where content will be written.
     * @throws {Error} If there is an error in writing the file.
     */
    generateToFile(template: string, outputFile: string): Promise<void>;
}
export default TemplateWriter;
