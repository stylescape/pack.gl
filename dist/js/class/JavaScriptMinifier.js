"use strict";
// class/JavaScriptMinifier.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const terser_1 = require("terser");
const fs_1 = require("fs");
// ============================================================================
// Classes
// ============================================================================
/**
 * Class to minify JavaScript files using Terser.
 */
class JavaScriptMinifier {
    /**
     * Constructs an instance with the provided configuration.
     * @param {any} config - Configuration object - minification options for Terser.
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Minifies a JavaScript file.
     * @param {string} inputPath - Path to the input JavaScript file.
     * @param {string} outputPath - Path to save the minified output file.
     * @returns {Promise<void>} - A promise that resolves when minification is complete.
     */
    minifyFile(inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the input file
                const inputCode = yield fs_1.promises.readFile(inputPath, 'utf8');
                // Minify the file using Terser
                // const result = await minify(inputCode, options);
                const result = yield (0, terser_1.minify)(inputCode, this.config);
                // If minification is successful, write the output
                if (result.code) {
                    yield fs_1.promises.writeFile(outputPath, result.code);
                }
                else {
                    throw new Error('Minification resulted in empty output.');
                }
            }
            catch (error) {
                console.error(`Error minifying JavaScript file ${inputPath}:`, error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = JavaScriptMinifier;
