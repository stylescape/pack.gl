"use strict";
// ============================================================================
// Import
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
// ============================================================================
// Constants
// ============================================================================
const execAsync = util_1.default.promisify(child_process_1.exec);
// ============================================================================
// Classes
// ============================================================================
/**
 * Automates the process of generating documentation for software projects.
 * This class allows for flexible configuration of source paths, output paths,
 * and the specific documentation generation command to be used.
 */
class DocumentationGenerator {
    /**
     * Initializes a new instance of the DocumentationGenerator.
     *
     * @param sourcePath Path to the source files for which documentation should be generated.
     * @param outputPath Path where the generated documentation will be placed.
     * @param generatorCommand The command-line tool used for generating documentation (e.g., "jsdoc").
     */
    constructor(sourcePath, outputPath, generatorCommand) {
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
        this.generatorCommand = generatorCommand;
    }
    /**
     * Executes the documentation generation process using the specified
     * command-line tool. Handles both the execution of the command and the
     * management of output, including logging and error reporting.
     *
     * @returns A promise that resolves when documentation generation is successfully completed,
     *          or rejects with an error if the process fails.
     */
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Here, you can add any pre-generation logic if necessary
                // Execute the documentation generation command
                const { stdout, stderr } = yield execAsync(`${this.generatorCommand} -c ${this.sourcePath} -o ${this.outputPath}`);
                if (stderr) {
                    throw new Error(`Documentation generation failed: ${stderr}`);
                }
                console.log(stdout);
                console.log("Documentation generated successfully.");
                // Here, you can add any post-generation logic if necessary
            }
            catch (error) {
                console.error("Error occurred while generating documentation:", error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DocumentationGenerator;
// ============================================================================
// Example
// ============================================================================
// import DocumentationGenerator from "./DocumentationGenerator";
// const sourcePath = "./src";
// const outputPath = "./docs";
// const generatorCommand = "jsdoc"; // Ensure JSDoc is installed and available in your environment
// const docGenerator = new DocumentationGenerator(sourcePath, outputPath, generatorCommand);
// docGenerator.generate()
//     .then(() => console.log("Documentation generation completed."))
//     .catch(error => console.error(error));
