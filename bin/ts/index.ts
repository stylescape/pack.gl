// ============================================================================
// Import
// ============================================================================

// Import | Utility Classes
import DirectoryCleaner from "./class/directory/DirectoryCleaner";
import DirectoryCopier from "./class/directory/DirectoryCopier";
import DirectoryCreator from "./class/directory/DirectoryCreator";
import DirectoryScanner from "./class/directory/DirectoryScanner";
import FileCopier from "./class/file/FileCopier";
import FilenameExtractor from "./class/file/FilenameExtractor";
import FileRenamer from "./class/file/FileRenamer";

// Import | Internal Classes
import FontGenerator from "./class/FontGenerator.js";
import PackageCreator from "./class/package/PackageCreator.js";
import StyleProcessor from "./class/sass/StyleProcessor.js";
import VersionManager from "./class/version/VersionManager.js";
import VersionWriter from "./class/version/VersionWriter.js";

import JavaScriptMinifier from "./class/javascript/JavaScriptMinifier.js";
import TypeScriptCompiler from "./class/javascript/TypeScriptCompiler.js";
import NpmCommandRunner from "./class/NpmCommandRunner.js";
import StylizedLogger from "./class/StylizedLogger.js";
import TemplateWriter from "./class/TemplateWriter.js";

import SvgPackager from "./class/svg/SvgPackager.js";
import SvgReader from "./class/svg/SvgReader.js";
import SvgSpriteGenerator from "./class/svg/SvgSpriteGenerator.js";
import SvgToPngConverter from "./class/svg/SvgToPngConverter.js";

import CodeLinter from "./class/javascript/CodeLinter.js";
import DocumentationGenerator from "./class/javascript/DocumentationGenerator.js";
import JSONLoader from "./class/JSONLoader.js";
import TestRunner from "./class/TestRunner.js";

// Import necessary modules and classes
// import {
//     DirectoryCleaner,
//     DirectoryCopier,
//     FileCopier,
//     PackageCreator,
//     StylizedLogger,
//     VersionWriter,
//     readPackageJson,
// } from "pack.gl";
import path from "path";



// Export | Utility Classes
export {
    DirectoryCleaner,
    DirectoryCopier,
    DirectoryCreator,
    DirectoryScanner,
    FileCopier,
    FilenameExtractor,
    FileRenamer
};

// Export | Internal Classes
    export {
        CodeLinter,
        DocumentationGenerator,
        FontGenerator,
        JavaScriptMinifier,
        JSONLoader,
        NpmCommandRunner,
        PackageCreator,
        StyleProcessor,
        StylizedLogger,
        SvgPackager,
        SvgReader,
        SvgSpriteGenerator,
        SvgToPngConverter,
        TemplateWriter,
        TestRunner,
        TypeScriptCompiler,
        VersionManager,
        VersionWriter
    };

// ============================================================================
// Constants
// ============================================================================

const CONFIG = {
    path: {
        src:                "./src",
        dist:               "./dist",
        json_output:        "./dist",
        ts_input:           "./src/ts",
        ts_output:          "./dist/ts",
        js_output:          "./dist/js",
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
        // await gl_installer();


        // Dirs Clean
        // --------------------------------------------------------------------

        const directoryCleaner = new DirectoryCleaner();
        logger.header("Clean Directories");
        directoryCleaner.cleanDirectory(CONFIG.path.dist);
        logger.body(`Directory cleaned: ${CONFIG.path.dist}`);


        // Package JSON
        // --------------------------------------------------------------------

        const localPackageConfig = await readPackageJson("./package.json");
        const packageCreator = new PackageCreator(localPackageConfig);
        const packageConfig = packageCreator.config
        packageCreator.createPackageJson(CONFIG.path.dist);


        // Copy files
        // --------------------------------------------------------------------

        const fileCopier = new FileCopier();
        fileCopier.copyFileToDirectory(
            path.join(".", "README.md"),
            CONFIG.path.dist,
        )
        fileCopier.copyFileToDirectory(
            path.join(".", "LICENSE"),
            CONFIG.path.dist,
        )


        // Copy Dirs
        // --------------------------------------------------------------------

        const directoryCopier = new DirectoryCopier();
        await directoryCopier.recursiveCopy(
            CONFIG.path.ts_input,
            CONFIG.path.ts_output,
        );
        console.log("Files copied successfully.");


        // Version
        // --------------------------------------------------------------------

        const versionWriter = new VersionWriter();
        await versionWriter.writeVersionToFile("VERSION", packageConfig.version);


        // Compile TypeScript to JavaScript
        // --------------------------------------------------------------------

        const tsCompiler = new TypeScriptCompiler();
        const tsFiles = [
            path.join(CONFIG.path.ts_input, "index.ts"),
        ];
        const outputDir = "./dist/js";
        // console.log("Starting TypeScript compilation...");
        await tsCompiler.compile(tsFiles, outputDir);
        console.log("TypeScript compilation completed.");


    } catch (error) {
        console.error("An error occurred:", error);
    }

}


// ============================================================================
// Main
// ============================================================================

// Execute the main function
main();
