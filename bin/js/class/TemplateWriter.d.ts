declare class TemplateWriter {
    context: Record<string, any>;
    private config;
    private static defaultConfig;
    constructor(templatesDir: string, context?: Record<string, any>, customConfig?: Record<string, any>);
    generateTemplate(template: string): Promise<string>;
    generateToFile(template: string, outputFile: string): Promise<void>;
}
export default TemplateWriter;
