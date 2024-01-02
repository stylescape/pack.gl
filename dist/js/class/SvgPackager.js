"use strict";
// class/SvgPackager.ts
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
// import * as fs from 'fs';
const fs_extra = require("fs-extra");
const fs_1 = require("fs");
const glob = require("glob");
const path = require("path");
const url_1 = require("url");
const svgo_1 = require("svgo");
const svgo_2 = require("svgo");
// Convert the current file's URL to a file path
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
// Derive the directory name of the current module
const __dirname = path.dirname(__filename);
// ============================================================================
// Classes
// ============================================================================
/**
 * Class for packaging SVG files.
 * This class reads SVG files from a specified directory, optimizes them,
 * and creates corresponding TypeScript files.
 */
class SvgPackager {
    /**
     * Processes all SVG files in a given directory.
     * @param directory The directory containing SVG files to process.
     * @param outputDirectory The directory where optimized SVGs will be output as TypeScript files.
     */
    processSvgFiles(directory, outputDirectory, ts_output_directory, json_output_directory) {
        return __awaiter(this, void 0, void 0, function* () {
            const iconNames = [];
            try {
                console.log(`Processing directory: ${directory}`);
                const svgFiles = glob.sync(`${directory}/**/*.svg`);
                for (const file of svgFiles) {
                    console.log(`Processing file: ${file}`);
                    const iconName = this.sanitizeFileName(path.basename(file, '.svg'));
                    iconNames.push(iconName);
                    console.log(`Processing icon: ${iconName}`);
                    const svgContent = yield this.readSvgFile(file);
                    const optimizedSvg = yield this.optimizeSvg(file, svgContent);
                    // svgo will always add a final newline when in pretty mode
                    const resultSvg = optimizedSvg.trim();
                    // Write the optimized SVG file
                    yield this.writeSvgFile(file, iconName, resultSvg, outputDirectory);
                    // Write the optimized TypeScript file
                    yield this.writeTypeScriptFile(file, iconName, resultSvg, ts_output_directory);
                }
                yield this.writeIconsJson(iconNames, json_output_directory);
                console.log(`Successfully processed ${svgFiles.length} SVG files.`);
            }
            catch (error) {
                console.error('Error processing SVG files:', error);
                throw error;
            }
        });
    }
    /**
     * Reads the content of an SVG file.
     * @param filePath The path to the SVG file.
     * @returns The content of the SVG file.
     */
    readSvgFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const absolutePath = path.resolve(filePath);
                const svgContent = yield fs_1.promises.readFile(absolutePath, 'utf8');
                return svgContent;
            }
            catch (error) {
                console.error('Error reading file:', filePath, error);
                throw error;
            }
        });
    }
    /**
     * Sanitizes a file name to be a valid TypeScript identifier.
     * @param fileName The original file name.
     * @returns A sanitized version of the file name.
     */
    sanitizeFileName(fileName) {
        // Implement more robust sanitization logic if necessary
        return fileName.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    /**
     * Optimizes SVG content using SVGO.
     * @param svgContent The raw SVG content.
     * @returns The optimized SVG content.
     */
    optimizeSvg(filePath, svgContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = yield (0, svgo_2.loadConfig)(path.join(__dirname, '../config/svgo.config.js'));
                const result = yield svgo_1.default.optimize(svgContent, Object.assign({ path: filePath }, config));
                return result.data;
            }
            catch (error) {
                console.error('Error optimizing SVG:', error);
                throw error;
            }
        });
    }
    /**
     * Creates a TypeScript file from SVG content.
     * @param filePath The path of the SVG file.
     * @param svgContent The optimized SVG content.
     * @param outputDirectory The directory to output the TypeScript file.
     */
    writeTypeScriptFile(filePath, iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
                const outputPath = path.join(outputDirectory, `${iconName}.ts`);
                yield fs_extra.outputFile(outputPath, tsContent);
            }
            catch (error) {
                console.error(`Error creating TypeScript file for ${filePath}:`, error);
                throw error;
            }
        });
    }
    /**
     * Writes the SVG content to a file.
     * @param filePath The original file path of the SVG.
     * @param svgContent The SVG content to be written.
     * @param outputDirectory The directory to output the SVG file.
     */
    writeSvgFile(filePath, iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const outputPath = path.join(outputDirectory, `${iconName}.svg`);
                yield fs_extra.outputFile(outputPath, svgContent);
                console.log(`SVG file written successfully for ${iconName}`);
            }
            catch (error) {
                console.error(`Error writing SVG file for ${iconName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Writes a JSON file containing the names of processed icons.
     * This method creates a JSON file that lists all icon names which have
     * been processed, making it easier to reference or index these icons in
     * other parts of an application.
     *
     * @param iconNames An array of strings containing the names of the icons.
     * @param outputDirectory The directory where the JSON file will be saved.
     */
    writeIconsJson(iconNames, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jsonContent = JSON.stringify(iconNames, null, 2);
                const outputPath = path.join(outputDirectory, 'icons.json');
                yield fs_extra.outputFile(outputPath, jsonContent);
                console.log('Icons JSON file created successfully');
            }
            catch (error) {
                console.error('Error writing icons JSON file:', error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgPackager;
