"use strict";
// class/SvgSpriteGenerator.ts
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
const svg_sprite_1 = require("svg-sprite");
const fs_1 = require("fs");
const path_1 = require("path");
// ============================================================================
// Classes
// ============================================================================
/**
 * A class for generating SVG sprites from individual SVG files.
 */
class SvgSpriteGenerator {
    /**
     * Constructs an instance of SvgSpriteGenerator with the provided configuration.
     * @param {any} config - Configuration object for svg-sprite.
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Generates an SVG sprite from SVG files in a specified directory.
     * @param {string} sourceDir - Directory containing source SVG files.
     * @param {string} outputDir - Directory where the generated sprite will be saved.
     */
    generateSprite(sourceDir, outputDir) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgSpriteGenerator;
