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
    PackageCreator,
    VersionWriter,
    TypeScriptCompiler,
    // JavaScriptMinifier,
    StylizedLogger,
    gl_installer,
    readPackageJson,
} from 'pack.gl';


// ============================================================================
// Constants
// ============================================================================

const CONFIG = {
    path: {
        src:                './src',
        dist:               './dist',
        json_output:        './dist',
        ts_input:           './src/ts',
        ts_output:          './dist/ts',
        js_output:          './dist/js',

    },

};


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



        // Init Logger
        // --------------------------------------------------------------------

        const logger = new StylizedLogger();


        // Install .gl libraries
        // --------------------------------------------------------------------

        logger.header('Install .gl libraries');
        await gl_installer();


        // Dirs Clean
        // --------------------------------------------------------------------

        const directoryCleaner = new DirectoryCleaner();
        logger.header('Clean Directories');
        directoryCleaner.cleanDirectory(CONFIG.path.dist);
        logger.body(`Directory cleaned: ${CONFIG.path.dist}`);


        // Package JSON
        // --------------------------------------------------------------------

        const localPackageConfig = await readPackageJson('./package.json');
        const packageCreator = new PackageCreator(localPackageConfig);
        const packageConfig = packageCreator.config
        packageCreator.createPackageJson(CONFIG.path.dist);


        // Copy Dirs
        // --------------------------------------------------------------------
        
        const directoryCopier = new DirectoryCopier();
        await directoryCopier.recursiveCopy(
            CONFIG.path.ts_input,
            CONFIG.path.ts_output,
        );
        console.log('Files copied successfully.');


        // Version
        // --------------------------------------------------------------------

        const versionWriter = new VersionWriter();
        await versionWriter.writeVersionToFile('VERSION', packageConfig.version);


        // Compile TypeScript to JavaScript
        // --------------------------------------------------------------------

        const tsCompiler = new TypeScriptCompiler();
        const tsFiles = [
            path.join(CONFIG.path.ts_input, 'index.ts'),
        ];
        const outputDir = './dist/js';
        // console.log('Starting TypeScript compilation...');
        await tsCompiler.compile(tsFiles, outputDir);
        // console.log('TypeScript compilation completed.');



    } catch (error) {
        console.error('An error occurred:', error);
    }

}


// ============================================================================
// Main
// ============================================================================

// Execute the main function
main();
