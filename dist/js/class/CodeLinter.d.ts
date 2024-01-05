import { ESLint } from 'eslint';
declare class CodeLinter {
    private eslint;
    private projectRoot;
    constructor(projectRoot: string);
    /**
     * Runs ESLint on the specified files or directories.
     * @param targetFiles Array of file or directory paths to lint.
     * @returns A promise that resolves with the linting results.
     */
    lintFiles(targetFiles: string[]): Promise<ESLint.LintResult[]>;
}
export default CodeLinter;
