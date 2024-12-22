// ============================================================================
// Import
// ============================================================================

// Import | Utility Classes
import DirectoryScanner from './class/directory/DirectoryScanner';
import DirectoryCleaner from './class/directory/DirectoryCleaner';
import DirectoryCopier from './class/directory/DirectoryCopier';
import DirectoryCreator from './class/directory/DirectoryCreator';
import FileCopier from './class/file/FileCopier';
import FileRenamer from './class/file/FileRenamer';
import FilenameExtractor from './class/file/FilenameExtractor';

// Import | Internal Classes
import FontGenerator from './class/FontGenerator.js';
import PackageCreator from './class/package/PackageCreator.js';
import StyleProcessor from "./class/sass/StyleProcessor.js";
import VersionManager from './class/version/VersionManager.js';
import VersionWriter from './class/version/VersionWriter.js';

import TypeScriptCompiler from './class/javascript/TypeScriptCompiler.js';
import JavaScriptMinifier from './class/javascript/JavaScriptMinifier.js';
import NpmCommandRunner from './class/NpmCommandRunner.js';
import StylizedLogger from './class/StylizedLogger.js';
import TemplateWriter from './class/TemplateWriter.js';

import SvgReader from './class/svg/SvgReader.js';
import SvgToPngConverter from './class/svg/SvgToPngConverter.js';
import SvgSpriteGenerator from "./class/svg/SvgSpriteGenerator.js";
import SvgPackager from "./class/svg/SvgPackager.js";

import TestRunner from './class/TestRunner.js';
import DocumentationGenerator from './class/javascript/DocumentationGenerator.js';
import CodeLinter from './class/javascript/CodeLinter.js';
import JSONLoader from './class/JSONLoader.js';


// Import | Internal Functions
import gl_installer from './utils/gl_installer';
import cleanDirectory from './utils/clean_directory';
import readPackageJson from "./utils/readPackageJson.js"



// import { main } from "./pack.js"



// ============================================================================
// Export
// ============================================================================

export {

    // Export | Utility Classes
    DirectoryScanner,
    DirectoryCleaner,
    DirectoryCopier,
    DirectoryCreator,
    FileCopier,
    FileRenamer,
    FilenameExtractor,

    // // Export | Internal Classes
    FontGenerator,
    PackageCreator,
    StyleProcessor,
    VersionWriter,
    VersionManager,
    TypeScriptCompiler,
    JavaScriptMinifier,
    NpmCommandRunner,
    StylizedLogger,
    TemplateWriter,
    TestRunner,
    DocumentationGenerator,
    CodeLinter,
    JSONLoader,

    SvgReader,
    SvgToPngConverter,
    SvgSpriteGenerator,
    SvgPackager,

    // Export | Internal Functions
    gl_installer,
    cleanDirectory,
    readPackageJson,

    // main
};

// Export any specific types if needed
export * from './types';
export * from './cli.js';
export { main } from './pack';

// src/index.ts

// Export core modules and functionalities
export { Pipeline } from './core/Pipeline';
export { ConfigLoader } from './core/ConfigLoader';
export { LiveReloadServer } from './core/LiveReloadServer';
export { FileWatcher } from './core/FileWatcher';
export { PipelineManager } from './core/PipelineManager';

// Export any actions or utility functions
export { Action } from './core/Action'; // If this is an actual export from './core/Action'
// export { DirectoryCleaner } from './actions/DirectoryCleaner';
// export { FileCopier } from './actions/FileCopier';
// export { DirectoryCopier } from './actions/DirectoryCopier';
// export { VersionWriter } from './actions/VersionWriter';



// Export the main function if it needs to be accessed programmatically
