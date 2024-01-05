"use strict";
// class/CodeLinter.ts
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2023 Scape Agency BV
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ============================================================================
// Import
// ============================================================================
var eslint_1 = require("eslint");
// ============================================================================
// Classes
// ============================================================================
class CodeLinter {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.eslint = new eslint_1.ESLint({ cwd: projectRoot });
    }
    /**
     * Runs ESLint on the specified files or directories.
     * @param targetFiles Array of file or directory paths to lint.
     * @returns A promise that resolves with the linting results.
     */
    async lintFiles(targetFiles) {
        try {
            const results = await this.eslint.lintFiles(targetFiles);
            await eslint_1.ESLint.outputFixes(results);
            const formatter = await this.eslint.loadFormatter('stylish');
            const resultText = formatter.format(results);
            console.log(resultText);
            return results;
        }
        catch (error) {
            console.error('Error occurred while linting:', error);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = CodeLinter;
// import CodeLinter from './CodeLinter';
// const linter = new CodeLinter(process.cwd());
// linter.lintFiles(['src/**/*.ts'])
//     .then(results => {
//         console.log('Linting completed. Results:', results);
//     })
//     .catch(error => {
//         console.error('Linting error:', error);
//     });
