declare class DocumentationGenerator {
    private sourcePath;
    private outputPath;
    private generatorCommand;
    constructor(sourcePath: string, outputPath: string, generatorCommand: string);
    generate(): Promise<void>;
}
export default DocumentationGenerator;
