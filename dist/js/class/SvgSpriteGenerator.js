"use strict";
// class/SvgSpriteGenerator.ts
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
var svg_sprite_1 = __importDefault(require("svg-sprite"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var svgsprite_config_js_1 = __importDefault(require("../config/svgsprite.config.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * A class for generating SVG sprites from individual SVG files.
 */
class SvgSpriteGenerator {
    /**
     * Default configuration for the TypeScript compiler.
     */
    static { this.defaultConfig = svgsprite_config_js_1.default; }
    // private static defaultConfig: CompilerOptions = tsConfig;
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    constructor(customConfig = {}) {
        this.config = {
            ...SvgSpriteGenerator.defaultConfig,
            ...customConfig
        };
    }
    /**
     * Generates an SVG sprite from SVG files in a specified directory.
     * @param {string} sourceDir - Directory containing source SVG files.
     * @param {string} outputDir - Directory where the generated sprite will be saved.
     */
    async generateSprite(sourceDir, outputDir) {
        try {
            const files = fs_1.default.readdirSync(sourceDir);
            const sprite = new svg_sprite_1.default(this.config);
            files.forEach(file => {
                if (path_1.default.extname(file) === '.svg') {
                    const svgPath = path_1.default.resolve(sourceDir, file);
                    const content = fs_1.default.readFileSync(svgPath, 'utf8');
                    sprite.add(svgPath, null, content);
                }
            });
            sprite.compile((error, result) => {
                if (error) {
                    throw error;
                }
                for (const mode in result) {
                    for (const resource in result[mode]) {
                        const outputPath = path_1.default.resolve(outputDir, result[mode][resource].path);
                        fs_1.default.mkdirSync(path_1.default.dirname(outputPath), { recursive: true });
                        fs_1.default.writeFileSync(outputPath, result[mode][resource].contents);
                    }
                }
            });
        }
        catch (err) {
            console.error('Error generating SVG sprite:', err);
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgSpriteGenerator;
