// class/PackageCreator.ts

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
import { PackageJson } from '../interface/PackageJson.js';
import packageConfig from "../config/package.config.js"

// ============================================================================
// Classes
// ============================================================================

/**
 * A class for creating a package.json file for a project.
 */
 class PackageCreator {



    /**
     *  Configuration for the Package.json.
     */
     public config: any;
     // private config: ts.CompilerOptions;
     // private config: { [key: symbol]: any};
 
     /**
      * Default configuration for Package.json.
      */
      private static defaultConfig: any = packageConfig;
 
    /**
     * Initializes a new instance of the PackageCreator class.
     * @param {PackageJson} customConfig - The content to be written into package.json.
     */
     constructor(
        customConfig: any = {},
        //  customConfig: any = {},
         // customConfig: ts.CompilerOptions = {},
     ) {
        let newConfig = {
            // Populate with necessary fields from packageData
            name: customConfig.name,
            version: customConfig.version,
            description: customConfig.description,
            keywords: customConfig.keywords,
            license: customConfig.license,
            homepage: customConfig.homepage,
            // main: 'index.js',
            dependencies: customConfig.dependencies,
            // files: [
            //     "svg/**/*.{svg}",
            //     "js/**/*.{js,map}",
            //     "ts/**/*.ts",
            //     "css/**/*.{css,map}",
            //     "scss/**/*.{scss}",
            //     "font/**/*.{eot,otf,ttf,woff,woff2}",
            //     "!.DS_Store"
            // ],
        }

         this.config = {
             ...PackageCreator.defaultConfig,
             ...newConfig
         };
     }



    
    /**
     * Creates a package.json file in the specified directory.
     * Creates the directory if it does not exist.
     * @param outputDir - The directory where package.json will be created.
     */
     async createPackageJson(outputDir: string): Promise<void> {
        const filePath = path.join(outputDir, 'package.json');
        const data = JSON.stringify(this.config, null, 2);

        try {
            // Ensure the output directory exists
            await this.ensureDirectoryExists(outputDir);

            // Write the package.json file
            await fs.writeFile(filePath, data, 'utf-8');
            console.log(`package.json created at ${filePath}`);
        } catch (error) {
            console.error(`Error creating package.json: ${error}`);
            throw error;
        }
    }

    /**
     * Ensures that the given directory exists. Creates it if it does not exist.
     * @param dirPath - The path of the directory to check and create.
     */
     private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            // Check if error is an instance of NodeJS.ErrnoException
            if (error instanceof Error && (error as NodeJS.ErrnoException).code !== 'EEXIST') {
                throw error; // Rethrow if it's not a 'directory exists' error
            }
        }
    }
    
}


// ============================================================================
// Export
// ============================================================================

export default PackageCreator;
