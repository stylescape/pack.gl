// class/FontGenerator.ts

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

import { generateFonts, FontAssetType, OtherAssetType, RunnerOptions,  } from 'fantasticon';
import RunnerOptionalOptions from 'fantasticon';
import fantasticonConfig from "../config/fantasticon.config.js"


// ============================================================================
// Classes
// ============================================================================

class FontGenerator {

    /**
     *  Configuration for the TypeScript compiler.
     */
     private config: any;

     /**
      * Default configuration for the TypeScript compiler.
      */
     private static defaultConfig: any = fantasticonConfig;
     // private static defaultConfig: CompilerOptions = tsConfig;
 
     /**
      * Constructs an instance with merged configuration of default and custom options.
      * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
      */
     constructor(
         customConfig: any = {},
     ) {
         this.config = {
             ...FontGenerator.defaultConfig,
             ...customConfig
         };
     }





    async generateFonts(
        sourceDirectory: string,
        outputDiectory: string,
    ) {

        const config: RunnerOptions = {

            ...this.config,

            // RunnerMandatoryOptions
            inputDir: sourceDirectory, // (required)
            outputDir: outputDiectory, // (required)


        };



        try {
            await generateFonts(config);
            console.log('Fonts generated successfully.');
        } catch (error) {
            console.error('Error generating fonts:', error);
        }

    }
}


// ============================================================================
// Export
// ============================================================================

export default FontGenerator;
