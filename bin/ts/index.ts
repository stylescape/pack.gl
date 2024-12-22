// ============================================================================
// Import
// ============================================================================

// Import necessary modules and classes
import path from "path";
import {
    DirectoryCleaner,
    DirectoryCopier,
    FileCopier,
    PackageCreator,
    VersionWriter,
    StylizedLogger,
    readPackageJson,
} from "pack.gl";
import TypeScriptCompiler from "./javascript/TypeScriptCompiler.js";

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
