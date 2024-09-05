// function/readPackageJson.ts

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

import fs from 'fs/promises';
import path from 'path';


// ============================================================================
// Functions
// ============================================================================

/**
 * Reads and parses the package.json file located at the specified path.
 * This function is designed to handle errors gracefully, such as file not found or JSON parsing errors.
 *
 * @param packageJsonPath - The relative or absolute path to the package.json file.
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON object from the package.json file.
 * @throws {Error} Throws an error if the file cannot be read or if the content is not valid JSON.
 */
async function readPackageJson(packageJsonPath: string): Promise<Object> {
    try {
        const fullPath = path.resolve(packageJsonPath);  // Ensures the path is absolute
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // Customize error message based on the error type
        if (error.code === 'ENOENT') {
            throw new Error(`The file at ${packageJsonPath} was not found.`);
        } else if (error instanceof SyntaxError) {
            throw new Error(`Error parsing JSON from ${packageJsonPath}: ${error.message}`);
        } else {
            throw new Error(`An unexpected error occurred while reading ${packageJsonPath}: ${error.message}`);
        }
    }
}
// async function readPackageJson(packageJsonPath: string) {
//     const fullPath = path.resolve(packageJsonPath);
//     const fileContent = await fs.readFile(fullPath, 'utf-8');
//     return JSON.parse(fileContent);
// }


// ============================================================================
// Export
// ============================================================================

export default readPackageJson;


// ============================================================================
// Example
// ============================================================================

// (async () => {
//     try {
//         const packageJson = await readPackageJson('./path/to/package.json');
//         console.log('Package JSON:', packageJson);
//     } catch (error) {
//         console.error('Failed to read package.json:', error);
//     }
// })();