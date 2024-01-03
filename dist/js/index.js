"use strict";
// script/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gl_installer = exports.NpmCommandRunner = exports.JavaScriptMinifier = exports.TypeScriptCompiler = exports.VersionWriter = exports.SvgSpriteGenerator = exports.StyleProcessor = exports.SvgPackager = exports.PackageCreator = exports.FontGenerator = exports.FileRenamer = exports.FileCopier = exports.DirectoryCreator = exports.DirectoryCopier = exports.DirectoryCleaner = void 0;
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
const DirectoryCleaner_1 = __importDefault(require("./class/DirectoryCleaner"));
exports.DirectoryCleaner = DirectoryCleaner_1.default;
const DirectoryCopier_1 = __importDefault(require("./class/DirectoryCopier"));
exports.DirectoryCopier = DirectoryCopier_1.default;
const DirectoryCreator_1 = __importDefault(require("./class/DirectoryCreator"));
exports.DirectoryCreator = DirectoryCreator_1.default;
const FileCopier_1 = __importDefault(require("./class/FileCopier"));
exports.FileCopier = FileCopier_1.default;
const FileRenamer_1 = __importDefault(require("./class/FileRenamer"));
exports.FileRenamer = FileRenamer_1.default;
// // Import | Internal Classes
const FontGenerator_js_1 = __importDefault(require("./class/FontGenerator.js"));
exports.FontGenerator = FontGenerator_js_1.default;
const PackageCreator_js_1 = __importDefault(require("./class/PackageCreator.js"));
exports.PackageCreator = PackageCreator_js_1.default;
const SvgPackager_js_1 = __importDefault(require("./class/SvgPackager.js"));
exports.SvgPackager = SvgPackager_js_1.default;
const StyleProcessor_js_1 = __importDefault(require("./class/StyleProcessor.js"));
exports.StyleProcessor = StyleProcessor_js_1.default;
const SvgSpriteGenerator_js_1 = __importDefault(require("./class/SvgSpriteGenerator.js"));
exports.SvgSpriteGenerator = SvgSpriteGenerator_js_1.default;
const VersionWriter_js_1 = __importDefault(require("./class/VersionWriter.js"));
exports.VersionWriter = VersionWriter_js_1.default;
const TypeScriptCompiler_js_1 = __importDefault(require("./class/TypeScriptCompiler.js"));
exports.TypeScriptCompiler = TypeScriptCompiler_js_1.default;
const JavaScriptMinifier_js_1 = __importDefault(require("./class/JavaScriptMinifier.js"));
exports.JavaScriptMinifier = JavaScriptMinifier_js_1.default;
const NpmCommandRunner_js_1 = __importDefault(require("./class/NpmCommandRunner.js"));
exports.NpmCommandRunner = NpmCommandRunner_js_1.default;
const gl_installer_1 = __importDefault(require("./functions/gl_installer"));
exports.gl_installer = gl_installer_1.default;
