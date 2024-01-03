declare class TemplateWriter {
    /**
     * Constructs a TemplateWriter instance.
     * @param templatesDir - Directory for Nunjucks templates.
     * @param enableCache - Enable or disable caching for Nunjucks.
     */
    constructor(templatesDir: string, enableCache?: boolean);
    /**
     * Generates a template using the provided template file and context.
     * @param template - The template file name.
     * @param context - Context data to render the template with.
     * @returns The rendered template as a string.
     */
    generateTemplate(template: string, context: {}): Promise<string>;
    /**
     * Writes the rendered template content to a file.
     * @param template - The template file name.
     * @param outputFile - The output file path.
     * @param context - Context data to render the template with.
     */
    generateToFile(template: string, outputFile: string, context: {}): Promise<void>;
}
export default TemplateWriter;
