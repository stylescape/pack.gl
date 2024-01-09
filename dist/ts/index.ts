// index.ts

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

// Import | Utility Classes
import DirectoryScanner from './class/DirectoryScanner';
import DirectoryCleaner from './class/DirectoryCleaner';
import DirectoryCopier from './class/DirectoryCopier';
import DirectoryCreator from './class/DirectoryCreator';
import FileCopier from './class/FileCopier';
import FileRenamer from './class/FileRenamer';
import FilenameExtractor from './class/FilenameExtractor';

// Import | Internal Classes
import FontGenerator from './class/FontGenerator.js';
import PackageCreator from './class/PackageCreator.js';
import StyleProcessor from "./class/StyleProcessor.js";
import VersionManager from './class/VersionManager.js';
import VersionWriter from './class/VersionWriter.js';


import TypeScriptCompiler from './class/TypeScriptCompiler.js';
import JavaScriptMinifier from './class/JavaScriptMinifier.js';
import NpmCommandRunner from './class/NpmCommandRunner.js';
import StylizedLogger from './class/StylizedLogger.js';
import TemplateWriter from './class/TemplateWriter.js';

import SvgReader from './class/SvgReader.js';
import SvgToPngConverter from './class/SvgToPngConverter.js';
import SvgSpriteGenerator from "./class/SvgSpriteGenerator.js";
import SvgPackager from "./class/SvgPackager.js";

import TestRunner from './class/TestRunner.js';
import DocumentationGenerator from './class/DocumentationGenerator.js';
import CodeLinter from './class/CodeLinter.js';
import JSONLoader from './class/JSONLoader.js';


// Import | Internal Functions
import gl_installer from './function/gl_installer';
import cleanDirectory from './function/clean_directory';
import readPackageJson from "./function/readPackageJson.js"


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

};
