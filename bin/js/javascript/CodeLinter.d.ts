import { ESLint } from "eslint";
declare class CodeLinter {
    private eslint;
    private projectRoot;
    constructor(projectRoot: string);
    lintFiles(targetFiles: string[]): Promise<ESLint.LintResult[]>;
}
export default CodeLinter;
