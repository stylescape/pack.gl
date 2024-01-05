declare class DocumentationGenerator {
    private sourcePath;
    private outputPath;
    private generatorCommand;
    constructor(sourcePath: string, outputPath: string, generatorCommand: string);
    /**
     * Generates documentation based on the provided configuration.
     * @returns A promise that resolves when the documentation generation is complete.
     */
    generate(): Promise<void>;
}
export default DocumentationGenerator;
