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
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_1 = require("eslint");
// ============================================================================
// Classes
// ============================================================================
/**
 * A class responsible for setting up and running linting tasks using ESLint.
 * This class encapsulates all necessary configurations and methods to perform
 * linting of TypeScript files within a given project root directory.
 */
class CodeLinter {
    /**
     * Initializes a new instance of the CodeLinter class with a specified
     * project root.
     *
     * @param projectRoot The root directory of the project where linting will
     * be performed.
     */
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.eslint = new eslint_1.ESLint({ cwd: projectRoot });
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
    lintFiles(targetFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.eslint.lintFiles(targetFiles);
                yield eslint_1.ESLint.outputFixes(results);
                const formatter = yield this.eslint.loadFormatter("stylish");
                const resultText = formatter.format(results);
                console.log(resultText);
                return results;
            }
            catch (error) {
                console.error("Error occurred while linting:", error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = CodeLinter;
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
