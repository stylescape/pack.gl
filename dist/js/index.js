"use strict";
// index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageJson = exports.cleanDirectory = exports.gl_installer = exports.SvgToPngConverter = exports.TemplateWriter = exports.StylizedLogger = exports.NpmCommandRunner = exports.JavaScriptMinifier = exports.TypeScriptCompiler = exports.VersionWriter = exports.SvgSpriteGenerator = exports.StyleProcessor = exports.SvgPackager = exports.PackageCreator = exports.FontGenerator = exports.FileRenamer = exports.FileCopier = exports.DirectoryCreator = exports.DirectoryCopier = exports.DirectoryCleaner = void 0;
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
var DirectoryCleaner_1 = __importDefault(require("./class/DirectoryCleaner"));
exports.DirectoryCleaner = DirectoryCleaner_1.default;
var DirectoryCopier_1 = __importDefault(require("./class/DirectoryCopier"));
exports.DirectoryCopier = DirectoryCopier_1.default;
var DirectoryCreator_1 = __importDefault(require("./class/DirectoryCreator"));
exports.DirectoryCreator = DirectoryCreator_1.default;
var FileCopier_1 = __importDefault(require("./class/FileCopier"));
exports.FileCopier = FileCopier_1.default;
var FileRenamer_1 = __importDefault(require("./class/FileRenamer"));
exports.FileRenamer = FileRenamer_1.default;
// Import | Internal Classes
var FontGenerator_js_1 = __importDefault(require("./class/FontGenerator.js"));
exports.FontGenerator = FontGenerator_js_1.default;
var PackageCreator_js_1 = __importDefault(require("./class/PackageCreator.js"));
exports.PackageCreator = PackageCreator_js_1.default;
var SvgPackager_js_1 = __importDefault(require("./class/SvgPackager.js"));
exports.SvgPackager = SvgPackager_js_1.default;
var StyleProcessor_js_1 = __importDefault(require("./class/StyleProcessor.js"));
exports.StyleProcessor = StyleProcessor_js_1.default;
var SvgSpriteGenerator_js_1 = __importDefault(require("./class/SvgSpriteGenerator.js"));
exports.SvgSpriteGenerator = SvgSpriteGenerator_js_1.default;
var VersionWriter_js_1 = __importDefault(require("./class/VersionWriter.js"));
exports.VersionWriter = VersionWriter_js_1.default;
var TypeScriptCompiler_js_1 = __importDefault(require("./class/TypeScriptCompiler.js"));
exports.TypeScriptCompiler = TypeScriptCompiler_js_1.default;
var JavaScriptMinifier_js_1 = __importDefault(require("./class/JavaScriptMinifier.js"));
exports.JavaScriptMinifier = JavaScriptMinifier_js_1.default;
var NpmCommandRunner_js_1 = __importDefault(require("./class/NpmCommandRunner.js"));
exports.NpmCommandRunner = NpmCommandRunner_js_1.default;
var StylizedLogger_js_1 = __importDefault(require("./class/StylizedLogger.js"));
exports.StylizedLogger = StylizedLogger_js_1.default;
var TemplateWriter_js_1 = __importDefault(require("./class/TemplateWriter.js"));
exports.TemplateWriter = TemplateWriter_js_1.default;
var SvgToPngConverter_js_1 = __importDefault(require("./class/SvgToPngConverter.js"));
exports.SvgToPngConverter = SvgToPngConverter_js_1.default;
// Import | Internal Functions
var gl_installer_1 = __importDefault(require("./function/gl_installer"));
exports.gl_installer = gl_installer_1.default;
var clean_directory_1 = __importDefault(require("./function/clean_directory"));
exports.cleanDirectory = clean_directory_1.default;
var readPackageJson_js_1 = __importDefault(require("./function/readPackageJson.js"));
exports.readPackageJson = readPackageJson_js_1.default;
