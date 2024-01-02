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


import FontGenerator from './class/FontGenerator.js';
import SvgPackager from "./class/SvgPackager.js";
import StyleProcessor from "./class/StyleProcessor.js";
import SvgSpriteGenerator from "./class/SvgSpriteGenerator.js";
import PackageCreator from './class/PackageCreator.js';
import VersionWriter from './class/VersionWriter.js';
import FileCopier from './class/FileCopier.js'; 
import FileRenamer from './class/FileRenamer.js'; 
import DirectoryCreator from './class/DirectoryCreator';
import DirectoryCopier from './class/DirectoryCopier';
import DirectoryCleaner from './class/DirectoryCleaner';
import TypeScriptCompiler from './class/TypeScriptCompiler.js';
import JavaScriptMinifier from './class/JavaScriptMinifier.js';

// Import necessary configurations
import { CONFIG } from './config/config.js';
import svgspriteConfig from "./config/svgsprite.config.js";
import packageConfig from "./config/package.config.js"
import tsConfig from "./config/ts.config.js"
import tensorConfig from "./config/terser.config.js"


// ============================================================================
// Export
// ============================================================================

export {

    DirectoryCreator,
    DirectoryCopier,
    DirectoryCleaner,

};
