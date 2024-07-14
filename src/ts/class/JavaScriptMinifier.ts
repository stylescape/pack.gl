// class/JavaScriptMinifier.ts

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

import { minify } from 'terser';
import { promises as fs } from 'fs';
import terserConfig from "../config/terser.config.js"


// ============================================================================
// Classes
// ============================================================================

/**
 * Facilitates the minification of JavaScript files using the Terser library.
 * This class allows for flexible configuration of minification settings and aims
 * to produce optimized output files that are significantly reduced in size.
 */
class JavaScriptMinifier {

    /**
     * Configuration for the Terser minification process.
     */
    private config: any;
 
    /**
     * Default configuration for the Terser minification, loaded from an external configuration file.
     */
    private static defaultConfig: any = terserConfig;
 
    /**
     * Constructs an instance with merged configuration of default and optionally provided custom settings.
     * 
     * @param {any} customConfig Optional. Custom configuration object to override or extend the default Terser options.
     */
    constructor(
        customConfig: any = {},
    ) {
        this.config = {
            ...JavaScriptMinifier.defaultConfig,
            ...customConfig
        };
    }

    /**
     * Minifies a JavaScript file using the configured Terser settings.
     * 
     * @param {string} inputPath Path to the input JavaScript file.
     * @param {string} outputPath Path where the minified file will be saved.
     * @returns {Promise<void>} A promise that resolves when the minification process is complete, or rejects with an error.
     * @throws {Error} An error is thrown if there are issues reading the input file, the minification fails, or the output file cannot be written.
     */
    async minifyFile(
        inputPath: string,
        outputPath: string,
        // options: object = {}
    ): Promise<void> {

        try {
            // Read the input file
            const inputCode = await fs.readFile(inputPath, 'utf8');
            // Minify the file using Terser
            const result = await minify(inputCode, this.config);
            // If minification is successful, write the output
            if (result.code) {
                await fs.writeFile(outputPath, result.code);
            } else {
                throw new Error('Minification resulted in empty output.');
            }
        } catch (error) {
            console.error(`Error minifying JavaScript file ${inputPath}:`, error);
            throw error;
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default JavaScriptMinifier;


// ============================================================================
// Example
// ============================================================================


// import JavaScriptMinifier from './JavaScriptMinifier';

// const minifier = new JavaScriptMinifier();
// const inputPath = './path/to/source/file.js';
// const outputPath = './path/to/minified/file.min.js';

// minifier.minifyFile(inputPath, outputPath)
//     .then(() => console.log('JavaScript file has been minified successfully.'))
//     .catch(error => console.error('Failed to minify JavaScript file:', error));