// ============================================================================
// Import
// ============================================================================

// Import | Utility Classes
import DirectoryScanner from "./class/directory/DirectoryScanner";
import DirectoryCleaner from "./class/directory/DirectoryCleaner";
import DirectoryCopier from "./class/directory/DirectoryCopier";
import DirectoryCreator from "./class/directory/DirectoryCreator";
import FileCopier from "./class/file/FileCopier";
import FileRenamer from "./class/file/FileRenamer";
import FilenameExtractor from "./class/file/FilenameExtractor";

// Import | Internal Classes
import FontGenerator from "./class/FontGenerator.js";
import PackageCreator from "./class/package/PackageCreator.js";
import StyleProcessor from "./class/sass/StyleProcessor.js";
import VersionManager from "./class/version/VersionManager.js";
import VersionWriter from "./class/version/VersionWriter.js";

import TypeScriptCompiler from "./class/javascript/TypeScriptCompiler.js";
import JavaScriptMinifier from "./class/javascript/JavaScriptMinifier.js";
import NpmCommandRunner from "./class/NpmCommandRunner.js";
import StylizedLogger from "./class/StylizedLogger.js";
import TemplateWriter from "./class/TemplateWriter.js";

import SvgReader from "./class/svg/SvgReader.js";
import SvgToPngConverter from "./class/svg/SvgToPngConverter.js";
import SvgSpriteGenerator from "./class/svg/SvgSpriteGenerator.js";
import SvgPackager from "./class/svg/SvgPackager.js";

import TestRunner from "./class/TestRunner.js";
import DocumentationGenerator from "./class/javascript/DocumentationGenerator.js";
import CodeLinter from "./class/javascript/CodeLinter.js";
import JSONLoader from "./class/JSONLoader.js";


// Import | Internal Functions
import gl_installer from "./utils/gl_installer";
import cleanDirectory from "./utils/clean_directory";
import readPackageJson from "./utils/readPackageJson.js"

import * as cli from "./cli.js";

// ============================================================================
// Exports
// ============================================================================

// Export | Utility Classes
export {
    DirectoryScanner,
    DirectoryCleaner,
    DirectoryCopier,
    DirectoryCreator,
    FileCopier,
    FileRenamer,
    FilenameExtractor,
};

// Export | Internal Classes
export {
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
};



// Utility Functions
export { gl_installer, cleanDirectory, readPackageJson };

// Core Modules
// export { Pipeline } from "./core/Pipeline";
// export { ConfigLoader } from "./core/ConfigLoader";
// export { PipelineManager } from "./core/PipelineManager";

// Live Modules
// export { LiveReloadServer } from "./live/LiveReloadServer";
// export { FileWatcher } from "./live/FileWatcher";

// Actions and Other Utilities
// export { Action } from "./core/Action";

// Main Function
export { main } from "./pack";

// Additional Types
export * from "./types";

// CLI Functions (if required programmatically)
export * from "./cli.js";