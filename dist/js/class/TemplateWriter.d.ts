declare class TemplateWriter {
    context: {};
    /**
     *  Configuration for the Nunjucks writer compiler.
     */
    private config;
    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig;
    /**
     * Constructs a TemplateWriter instance.
     * @param templatesDir - Directory for Nunjucks templates.
     */
    constructor(templatesDir: string, context: {}, customConfig?: any);
    /**
     * Generates a template using the provided template file and context.
     * @param template - The template file name.
     * @returns The rendered template as a string.
     */
    generateTemplate(template: string): Promise<string>;
    /**
     * Writes the rendered template content to a file.
     * @param template - The template file name.
     * @param outputFile - The output file path.
     */
    generateToFile(template: string, outputFile: string): Promise<void>;
}
export default TemplateWriter;
