// script/index.ts

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

// Import necessary modules and classes
import path from 'path';
import {
    DirectoryCleaner,
    DirectoryCopier,
    DirectoryCreator,
    PackageCreator,
    VersionWriter,
    TypeScriptCompiler,
    // JavaScriptMinifier
} from 'pack.gl';

// Import necessary configurations
import { CONFIG } from './config/config.js';
import packageConfig from "./config/package.config.js"
import tsConfig from "./config/ts.config.js"


// ============================================================================
// Constants
// ============================================================================

// Initialize instances of necessary classes
const directories = Object.values(CONFIG.path);
const tsCompiler = new TypeScriptCompiler(tsConfig);
const packageCreator = new PackageCreator(packageConfig);
const versionWriter = new VersionWriter();
const directoryCopier = new DirectoryCopier();
const directoryCleaner = new DirectoryCleaner();
const directoryCreator = new DirectoryCreator();


// ============================================================================
// Functions
// ============================================================================

/**
 * Main function to orchestrate the various processes.
 * It handles SVG processing, font generation, SVG sprite generation, and SASS
 * processing.
 */
async function main() {

    try {


        // Dirs Clean
        // --------------------------------------------------------------------
        directoryCleaner.cleanDirectory(CONFIG.path.dist);
        console.log(`Directory cleaned: ${CONFIG.path.dist}`);

        // Dirs Create
        // --------------------------------------------------------------------
        console.log('Starting Directory creation...');
        // Assuming the base path is the current directory
        await directoryCreator.createDirectories('.', directories);



        // Copy Dirs
        // --------------------------------------------------------------------
        try {
            await directoryCopier.recursiveCopy(
                CONFIG.path.ts_input,
                CONFIG.path.ts_output,
            );
            console.log('Files copied successfully.');
        } catch (error) {
            console.error('Error while copying files:', error);
        }


        // Version
        // --------------------------------------------------------------------
        await versionWriter.writeVersionToFile('VERSION', packageConfig.version);


        // Package JSON
        // --------------------------------------------------------------------

        await packageCreator.createPackageJson(CONFIG.path.dist);


        // Compile TypeScript to JavaScript
        // --------------------------------------------------------------------


        try {
            // Other code...
    
            // TypeScript compilation
            const tsFiles = [
                path.join(CONFIG.path.ts_input, 'index.ts'),
                // './src/ts/index.ts',
                // './src/ts/file1.ts',
                // './src/ts/file2.ts'
            ]; // Replace with actual file paths
            const outputDir = './dist/js';
            
            console.log('Starting TypeScript compilation...');
            tsCompiler.compile(tsFiles, outputDir);
            console.log('TypeScript compilation completed.');
    
            // Other code...
        } catch (error) {
            console.error('An error occurred:', error);
        }


    } catch (error) {
        console.error('An error occurred:', error);
    }

}


// ============================================================================
// Main
// ============================================================================

// Execute the main function
main();
