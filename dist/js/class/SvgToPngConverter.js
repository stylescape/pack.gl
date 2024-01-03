"use strict";
// class/SvgToPngConverter.ts
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
var sharp_1 = __importDefault(require("sharp"));
var jsdom_1 = require("jsdom");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
class SvgToPngConverter {
    async convert(svgContent, outputPath, width, height) {
        try {
            // Ensure the output directory exists
            const outputDir = path_1.default.dirname(outputPath);
            if (!fs_1.default.existsSync(outputDir)) {
                fs_1.default.mkdirSync(outputDir, { recursive: true });
            }
            // Create a JSDOM instance to parse the SVG
            const dom = new jsdom_1.JSDOM(svgContent);
            const svgElement = dom.window.document.querySelector('svg');
            if (!svgElement) {
                throw new Error('Invalid SVG content');
            }
            if (width) {
                svgElement.setAttribute('width', width.toString());
            }
            if (height) {
                svgElement.setAttribute('height', height.toString());
            }
            const updatedSvgContent = svgElement.outerHTML;
            const pngBuffer = await (0, sharp_1.default)(Buffer.from(updatedSvgContent)).png().toBuffer();
            await (0, sharp_1.default)(pngBuffer).toFile(outputPath);
        }
        catch (error) {
            console.error(`Error converting SVG to PNG: ${error}`);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgToPngConverter;
