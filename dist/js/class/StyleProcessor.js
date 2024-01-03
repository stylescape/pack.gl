"use strict";
// class/StyleProcessor.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const sass = __importStar(require("sass"));
const postcss_1 = __importDefault(require("postcss"));
const fs_1 = __importDefault(require("fs"));
const postcss_config_expanded_js_1 = __importDefault(require("../config/postcss.config.expanded.js"));
const postcss_config_compressed_js_1 = __importDefault(require("../config/postcss.config.compressed.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Class responsible for processing styles, including compiling SCSS and
 * applying PostCSS transformations.
 */
class StyleProcessor {
    /**
     * Processes the given CSS with PostCSS based on the provided style option.
     * @param css The CSS string to process.
     * @param styleOption The style option, either 'expanded' or 'compressed'.
     * @returns Processed CSS string.
     */
    processPostCSS(css, styleOption) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = styleOption === 'expanded' ? postcss_config_expanded_js_1.default : postcss_config_compressed_js_1.default;
            return (0, postcss_1.default)(config.plugins).process(css, { from: undefined, map: { inline: false } });
        });
    }
    /**
     * Compiles SCSS to CSS and processes it using PostCSS.
     * @param inputFile Path to the input SCSS file.
     * @param outputFile Path to the output CSS file.
     * @param styleOption Style option for the output.
     */
    processStyles(inputFile, outputFile, styleOption) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Compile SCSS to CSS
                const result = yield sass.compileAsync(inputFile, { style: styleOption });
                // Process the compiled CSS with PostCSS and Autoprefixer
                const processed = yield this.processPostCSS(result.css, styleOption);
                // Write the processed CSS to a file
                fs_1.default.writeFileSync(outputFile, processed.css);
                // Write the source map file
                if (processed.map) {
                    fs_1.default.writeFileSync(`${outputFile}.map`, processed.map.toString());
                }
            }
            catch (err) {
                // Handle errors in the compilation or processing
                console.error(`Error processing styles from ${inputFile}:`, err);
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = StyleProcessor;
