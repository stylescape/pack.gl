// class/DocumentationGenerator.ts

// ============================================================================
// Imports
// ============================================================================

import { execFile } from "child_process";
import util from "util";

// ============================================================================
// Constants
// ============================================================================

const execFileAsync = util.promisify(execFile);

// ============================================================================
// Classes
// ============================================================================

/**
 * Automates the process of generating documentation for software projects.
 * This class allows for flexible configuration of source paths, output paths,
 * and the specific documentation generation command to be used.
 */
class DocumentationGenerator {


    // Parameters
    // ========================================================================

    private sourcePath: string;
    private outputPath: string;
    private generatorCommand: string;


    // Constructor
    // ========================================================================

    /**
     * Initializes a new instance of the DocumentationGenerator.
     * 
     * @param sourcePath - Path to the source files for which documentation
     * should be generated.
     * @param outputPath - Path where the generated documentation will be
     * placed.
     * @param generatorCommand - The command-line tool used for generating
     * documentation (e.g., "jsdoc").
     */
    constructor(
        sourcePath: string,
        outputPath: string,
        generatorCommand: string
    ) {
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
        this.generatorCommand = generatorCommand;
    }


    // Methods
    // ========================================================================

    /**
     * Executes the documentation generation process using the specified
     * command-line tool. Handles both the execution of the command and the
     * management of output, including logging and error reporting.
     * 
     * @returns A promise that resolves when documentation generation is
     * successfully completed, or rejects with an error if the process fails.
     */
    async generate(): Promise<void> {
        try {
            // Prepare command arguments safely
            const args = [
                "-c",
                this.sourcePath,
                "-o",
                this.outputPath
            ];

            // Execute the documentation generation command safely without
            // shell interpolation
            const { stdout, stderr } = await execFileAsync(
                this.generatorCommand,
                args
            );

            if (stderr) {
                throw new Error(`Documentation generation failed: ${stderr}`);
            }

            console.log(stdout);
            console.log(
                "Documentation generated successfully."
            );
        } catch (error) {
            console.error(
                "Error occurred while generating documentation:",
                error
            );
            throw error;
        }
    }
}

// ============================================================================
// Export
// ============================================================================

export default DocumentationGenerator;

// ============================================================================
// Example Usage
// ============================================================================

// import DocumentationGenerator from "./DocumentationGenerator";

// const sourcePath = "./src";
// const outputPath = "./docs";
// const generatorCommand = "jsdoc"; // Ensure JSDoc is installed and available in your environment

// const docGenerator = new DocumentationGenerator(sourcePath, outputPath, generatorCommand);

// docGenerator.generate()
//     .then(() => console.log("Documentation generation completed."))
//     .catch(error => console.error(error));