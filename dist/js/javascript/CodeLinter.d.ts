import { ESLint } from "eslint";
/**
 * A class responsible for setting up and running linting tasks using ESLint.
 * This class encapsulates all necessary configurations and methods to perform
 * linting of TypeScript files within a given project root directory.
 */
declare class CodeLinter {
    private eslint;
    private projectRoot;
    /**
     * Initializes a new instance of the CodeLinter class with a specified
     * project root.
     *
     * @param projectRoot The root directory of the project where linting will
     * be performed.
     */
    constructor(projectRoot: string);
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
    lintFiles(targetFiles: string[]): Promise<ESLint.LintResult[]>;
}
export default CodeLinter;
