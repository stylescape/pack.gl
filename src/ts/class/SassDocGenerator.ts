// class/SassDocGenerator.ts

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
// Imports
// ============================================================================

import * as sassdoc from 'sassdoc';
import path from 'path';


// ============================================================================
// Class: SassDocGenerator
// ============================================================================

/**
 * SassDocGenerator is responsible for generating SASS documentation using SassDoc.
 * It provides methods to configure and execute the documentation generation process.
 */
class SassDocGenerator {

    /**
     * Generates SASS documentation for the specified source files or directories.
     * @param sourcePaths - Array of file or directory paths to generate documentation for.
     * @param destDir - The directory where the generated documentation should be saved.
     * @param options - Additional options for SassDoc configuration.
     * @returns A promise that resolves when documentation generation is complete.
     */
    public async generateDocumentation(
        sourcePaths: string[],
        destDir: string,
        options: sassdoc.Options = {}
    ): Promise<void> {
        try {
            // Merge custom options with default options
            const config: sassdoc.Options = {
                dest: path.resolve(destDir),
                verbose: true,
                ...options
            };

            // Run SassDoc to generate the documentation
            await sassdoc(sourcePaths, config);

            console.log(`SASS documentation successfully generated at: ${config.dest}`);
        } catch (error) {
            console.error(
                'An error occurred while generating SASS documentation:',
                error
        );
            throw error;
        }
    }
}


// ============================================================================
// Exports
// ============================================================================

export default SassDocGenerator;


// ============================================================================
// Example Usage
// ============================================================================

// import SassDocGenerator from './SassDocGenerator';

// const sassDocGenerator = new SassDocGenerator();

// sassDocGenerator.generateDocumentation(['src/styles'], 'docs/sass')
//     .then(() => {
//         console.log('Documentation generation complete.');
//     })
//     .catch(error => {
//         console.error('Error generating documentation:', error);
//     });