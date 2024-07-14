// class/CodeLinter.ts

// Copyright 2024 Scape Agency BV

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

import { ESLint } from 'eslint';
import path from 'path';


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
     * @param projectRoot The root directory of the project where linting will
     * be performed.
     */
    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.eslint = new ESLint({ cwd: projectRoot });
    }

    /**
     * Runs ESLint on the specified files or directories and fixes fixable issues.
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
            const formatter = await this.eslint.loadFormatter('stylish');
            const resultText = formatter.format(results);

            console.log(resultText);
            return results;
        } catch (error) {
            console.error('Error occurred while linting:', error);
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

// import CodeLinter from './CodeLinter';

// const linter = new CodeLinter(process.cwd());

// linter.lintFiles(['src/**/*.ts'])
//     .then(results => {
//         console.log('Linting completed. Results:', results);
//     })
//     .catch(error => {
//         console.error('Linting error:', error);
//     });
