/**
 * Automates the process of generating documentation for software projects.
 * This class allows for flexible configuration of source paths, output paths,
 * and the specific documentation generation command to be used.
 */
declare class DocumentationGenerator {
    private sourcePath;
    private outputPath;
    private generatorCommand;
    /**
     * Initializes a new instance of the DocumentationGenerator.
     *
     * @param sourcePath - Path to the source files for which documentation should be generated.
     * @param outputPath - Path where the generated documentation will be placed.
     * @param generatorCommand - The command-line tool used for generating documentation (e.g., "jsdoc").
     */
    constructor(sourcePath: string, outputPath: string, generatorCommand: string);
    /**
     * Executes the documentation generation process using the specified
     * command-line tool. Handles both the execution of the command and the
     * management of output, including logging and error reporting.
     *
     * @returns A promise that resolves when documentation generation is successfully completed,
     *          or rejects with an error if the process fails.
     */
    generate(): Promise<void>;
}
export default DocumentationGenerator;
