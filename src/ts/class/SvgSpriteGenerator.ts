// class/SvgSpriteGenerator.ts

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

import svgSprite from 'svg-sprite';
import fs from 'fs';
import path from 'path';
import svgspriteConfig from "../config/svgsprite.config.js"


// ============================================================================
// Classes
// ============================================================================

/**
 * Facilitates the generation of SVG sprites from individual SVG files.
 * This class uses svg-sprite to compile multiple SVG files into a single sprite sheet,
 * which is useful for efficiently managing and using graphics in web projects.
 */
class SvgSpriteGenerator {


    /**
     * Constructs an instance of SvgSpriteGenerator with the provided configuration.
     * @param {svgSprite.Config} config - Configuration object for svg-sprite.
     */

    /**
     *  Configuration for the TypeScript compiler.
     */
    private config: svgSprite.Config;

    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig: svgSprite.Config = svgspriteConfig;
     // private static defaultConfig: CompilerOptions = tsConfig;
 
    /**
     * Constructs an instance with a merged configuration of default settings and optional customizations.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    constructor(
         customConfig: svgSprite.Config = {},
     ) {
         this.config = {
             ...SvgSpriteGenerator.defaultConfig,
             ...customConfig
         };
     }


    /**
     * Generates an SVG sprite from SVG files in a specified directory.
     * @param {string} sourceDir - Directory containing source SVG files.
     * @param {string} outputDir - Directory where the generated sprite will be saved.
     */
    async generateSprite(sourceDir: string, outputDir: string) {
        try {
            const files = fs.readdirSync(sourceDir);
            const sprite = new svgSprite(this.config);

            files.forEach(file => {
                if (path.extname(file) === '.svg') {
                    const svgPath = path.resolve(sourceDir, file);
                    const content = fs.readFileSync(svgPath, 'utf8');
                    sprite.add(svgPath, null, content);
                }
            });

            sprite.compile((error, result) => {
                if (error) {
                    throw error;
                }

                for (const mode in result) {
                    for (const resource in result[mode]) {
                        const outputPath = path.resolve(
                            outputDir,
                            result[mode][resource].path
                        );
                        fs.mkdirSync(
                            path.dirname(outputPath),
                            { recursive: true }
                        );
                        fs.writeFileSync(
                            outputPath,
                            result[mode][resource].contents
                        );
                    }
                }
            });

        } catch (err) {
            console.error('Error generating SVG sprite:', err);
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default SvgSpriteGenerator;


// ============================================================================
// Example
// ============================================================================


// import SvgSpriteGenerator from './SvgSpriteGenerator';

// const spriteGenerator = new SvgSpriteGenerator();
// const sourceDirectory = 'path/to/source/svg/files';
// const outputDirectory = 'path/to/output/sprites';

// spriteGenerator.generateSprite(sourceDirectory, outputDirectory)
//     .then(() => console.log('SVG sprite has been successfully generated.'))
//     .catch(error => console.error('Failed to generate SVG sprite:', error));