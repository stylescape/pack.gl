"use strict";
// class/SvgPackager.ts
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
// import * as fs from 'fs';
var fs_extra = __importStar(require("fs-extra"));
var fs_1 = require("fs");
var glob = __importStar(require("glob"));
var path = __importStar(require("path"));
var url_1 = require("url");
var svgo_1 = __importDefault(require("svgo"));
var svgo_2 = require("svgo");
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
    async processSvgFiles(directory, outputDirectory, ts_output_directory, json_output_directory) {
        const iconNames = [];
        try {
            console.log(`Processing directory: ${directory}`);
            const svgFiles = glob.sync(`${directory}/**/*.svg`);
            for (const file of svgFiles) {
                console.log(`Processing file: ${file}`);
                const iconName = this.sanitizeFileName(path.basename(file, '.svg'));
                iconNames.push(iconName);
                console.log(`Processing icon: ${iconName}`);
                const svgContent = await this.readSvgFile(file);
                const optimizedSvg = await this.optimizeSvg(file, svgContent);
                // svgo will always add a final newline when in pretty mode
                const resultSvg = optimizedSvg.trim();
                // Write the optimized SVG file
                await this.writeSvgFile(file, iconName, resultSvg, outputDirectory);
                // Write the optimized TypeScript file
                await this.writeTypeScriptFile(file, iconName, resultSvg, ts_output_directory);
            }
            await this.writeIconsJson(iconNames, json_output_directory);
            console.log(`Successfully processed ${svgFiles.length} SVG files.`);
        }
        catch (error) {
            console.error('Error processing SVG files:', error);
            throw error;
        }
    }
    /**
     * Reads the content of an SVG file.
     * @param filePath The path to the SVG file.
     * @returns The content of the SVG file.
     */
    async readSvgFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            const svgContent = await fs_1.promises.readFile(absolutePath, 'utf8');
            return svgContent;
        }
        catch (error) {
            console.error('Error reading file:', filePath, error);
            throw error;
        }
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
    async optimizeSvg(filePath, svgContent) {
        try {
            const config = await (0, svgo_2.loadConfig)(path.join(__dirname, '../config/svgo.config.js'));
            const result = await svgo_1.default.optimize(svgContent, { path: filePath, ...config } // Add SVGO options if needed
            );
            return result.data;
        }
        catch (error) {
            console.error('Error optimizing SVG:', error);
            throw error;
        }
    }
    /**
     * Creates a TypeScript file from SVG content.
     * @param filePath The path of the SVG file.
     * @param svgContent The optimized SVG content.
     * @param outputDirectory The directory to output the TypeScript file.
     */
    async writeTypeScriptFile(filePath, iconName, svgContent, outputDirectory) {
        try {
            const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
            const outputPath = path.join(outputDirectory, `${iconName}.ts`);
            await fs_extra.outputFile(outputPath, tsContent);
        }
        catch (error) {
            console.error(`Error creating TypeScript file for ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Writes the SVG content to a file.
     * @param filePath The original file path of the SVG.
     * @param svgContent The SVG content to be written.
     * @param outputDirectory The directory to output the SVG file.
     */
    async writeSvgFile(filePath, iconName, svgContent, outputDirectory) {
        try {
            const outputPath = path.join(outputDirectory, `${iconName}.svg`);
            await fs_extra.outputFile(outputPath, svgContent);
            console.log(`SVG file written successfully for ${iconName}`);
        }
        catch (error) {
            console.error(`Error writing SVG file for ${iconName}:`, error);
            throw error;
        }
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
    async writeIconsJson(iconNames, outputDirectory) {
        try {
            const jsonContent = JSON.stringify(iconNames, null, 2);
            const outputPath = path.join(outputDirectory, 'icons.json');
            await fs_extra.outputFile(outputPath, jsonContent);
            console.log('Icons JSON file created successfully');
        }
        catch (error) {
            console.error('Error writing icons JSON file:', error);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgPackager;
