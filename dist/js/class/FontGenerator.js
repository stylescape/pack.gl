"use strict";
// class/FontGenerator.ts
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
var fantasticon_1 = require("fantasticon");
var fantasticon_config_js_1 = __importDefault(require("../config/fantasticon.config.js"));
// ============================================================================
// Classes
// ============================================================================
class FontGenerator {
    /**
     * Default configuration for the TypeScript compiler.
     */
    static { this.defaultConfig = fantasticon_config_js_1.default; }
    // private static defaultConfig: CompilerOptions = tsConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    constructor(customConfig = {}) {
        this.config = {
            ...FontGenerator.defaultConfig,
            ...customConfig
        };
    }
    async generateFonts(sourceDirectory, outputDiectory) {
        const config = {
            ...this.config,
            // RunnerMandatoryOptions
            inputDir: sourceDirectory, // (required)
            outputDir: outputDiectory
        };
        try {
            await (0, fantasticon_1.generateFonts)(config);
            console.log('Fonts generated successfully.');
        }
        catch (error) {
            console.error('Error generating fonts:', error);
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = FontGenerator;
