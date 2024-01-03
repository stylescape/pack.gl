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
import DirectoryCleaner from './class/DirectoryCleaner';
import DirectoryCopier from './class/DirectoryCopier';
import DirectoryCreator from './class/DirectoryCreator';
import FileCopier from './class/FileCopier';
import FileRenamer from './class/FileRenamer';

// Import | Internal Classes
import FontGenerator from './class/FontGenerator.js';
import PackageCreator from './class/PackageCreator.js';
import SvgPackager from "./class/SvgPackager.js";
import StyleProcessor from "./class/StyleProcessor.js";
import SvgSpriteGenerator from "./class/SvgSpriteGenerator.js";
import VersionWriter from './class/VersionWriter.js';
import TypeScriptCompiler from './class/TypeScriptCompiler.js';
import JavaScriptMinifier from './class/JavaScriptMinifier.js';
import NpmCommandRunner from './class/NpmCommandRunner.js';
import StylizedLogger from './class/StylizedLogger.js';
import TemplateWriter from './class/TemplateWriter.js';
import SvgToPngConverter from './class/SvgToPngConverter.js';

// Import | Internal Functions
import gl_installer from './function/gl_installer';
import cleanDirectory from './function/clean_directory';


// ============================================================================
// Export
// ============================================================================

export {

    // Export | Utility Classes
    DirectoryCleaner,
    DirectoryCopier,
    DirectoryCreator,
    FileCopier,
    FileRenamer,

    // // Export | Internal Classes
    FontGenerator,
    PackageCreator,
    SvgPackager,
    StyleProcessor,
    SvgSpriteGenerator,
    VersionWriter,
    TypeScriptCompiler,
    JavaScriptMinifier,
    NpmCommandRunner,
    StylizedLogger,
    TemplateWriter,
    SvgToPngConverter,

    // Export | Internal Functions
    gl_installer,
    cleanDirectory,

};
