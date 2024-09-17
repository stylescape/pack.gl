// ============================================================================
// Import
// ============================================================================

import { ESLint } from "eslint";


// ============================================================================
// Classes
// ============================================================================

/**
 * A class responsible for setting up and running linting tasks using ESLint.
 * This class encapsulates all necessary configurations and methods to perform
 * linting of TypeScript files within a given project root directory.
 */
class CodeLinter {

    private eslint: ESLint;
    private projectRoot: string;

    /**
     * Initializes a new instance of the CodeLinter class with a specified
     * project root.
     * 
     * @param projectRoot The root directory of the project where linting will
     * be performed.
     */
    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.eslint = new ESLint({ cwd: projectRoot });
    }

    /**
     * Runs ESLint on the specified files or directories and fixes fixable
     * issues.
     * 
     * @param targetFiles Array of file or directory paths to lint.
     * @returns A promise that resolves with the linting results, including
     * any fixes applied.
     * @throws An error if linting fails due to configuration issues or file
     * reading problems.
     */
    async lintFiles(targetFiles: string[]): Promise<ESLint.LintResult[]> {
        try {
            const results = await this.eslint.lintFiles(targetFiles);
            await ESLint.outputFixes(results);

            const formatter = await this.eslint.loadFormatter("stylish");
            const resultText = formatter.format(results);
            console.log(resultText);

            return results;

        } catch (error) {
            console.error("Error occurred while linting:", error);
            throw error;
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default CodeLinter;


// ============================================================================
// Example
// ============================================================================

// import CodeLinter from "./CodeLinter";

// const linter = new CodeLinter(process.cwd());

// linter.lintFiles(["src/**/*.ts"])
//     .then(results => {
//         console.log("Linting completed. Results:", results);
//     })
//     .catch(error => {
//         console.error("Linting error:", error);
//     });
