"use strict";
// script/class/SvgPackager.ts
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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const svgo_1 = __importDefault(require("svgo"));
const svgo_2 = require("svgo");
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
     * Constructor for SvgPackager class.
     * Optionally accepts configurations or dependencies.
     */
    constructor(svgoConfigPath) {
        this.svgoConfigPath = svgoConfigPath;
    }
    /**
     * Processes all SVG files in a given directory.
     * @param inputDirectory The directory containing SVG files to process.
     * @param outputDirectory The directory where optimized SVGs will be output as TypeScript files.
     */
    processSvgFiles(inputDirectory, outputDirectory, ts_output_directory, json_output_directory) {
        return __awaiter(this, void 0, void 0, function* () {
            const iconNames = [];
            try {
                console.log(`Processing directory: ${inputDirectory}`);
                const svgFiles = glob.sync(`${inputDirectory}/**/*.svg`);
                for (const file of svgFiles) {
                    console.log(`Processing file: ${file}`);
                    const iconName = this.sanitizeFileName(path.basename(file, '.svg'));
                    iconNames.push(iconName);
                    console.log(`Processing icon: ${iconName}`);
                    const svgContent = yield this.readSvgFile(file);
                    const optimizedSvg = yield this.optimizeSvg(svgContent);
                    // const optimizedSvg = await this.optimizeSvg(file, svgContent);
                    // svgo will always add a final newline when in pretty mode
                    const resultSvg = optimizedSvg.trim();
                    // Write the optimized SVG file
                    yield this.writeSvgFile(
                    // file,
                    iconName, resultSvg, outputDirectory);
                    // Write the optimized TypeScript file
                    yield this.writeTypeScriptFile(
                    // file,
                    iconName, resultSvg, ts_output_directory);
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
    // public async processSvgFiles(directory: string, outputDirectory: string): Promise<void> {
    //     try {
    //         console.log(`Processing directory: ${directory}`);
    //         const svgFiles = await this.findSvgFiles(directory);
    //         for (const file of svgFiles) {
    //             const iconName = this.sanitizeFileName(path.basename(file, '.svg'));
    //             console.log(`Processing file: ${file}`);
    //             const svgContent = await this.readSvgFile(file);
    //             const optimizedSvg = await this.optimizeSvg(svgContent);
    //             await this.writeFiles(iconName, optimizedSvg, outputDirectory);
    //         }
    //         console.log(`Successfully processed ${svgFiles.length} SVG files.`);
    //     } catch (error) {
    //         console.error('Error processing SVG files:', error);
    //         throw error;
    //     }
    // }
    // private async findSvgFiles(directory: string): Promise<string[]> {
    //     return new Promise((resolve, reject) => {
    //         glob(`${directory}/**/*.svg`, (err, files) => {
    //             if (err) reject(err);
    //             else resolve(files);
    //         });
    //     });
    // }
    /**
     * Reads the content of an SVG file.
     * @param filePath The path to the SVG file.
     * @returns The content of the SVG file.
     */
    // private async readSvgFile(filePath: string): Promise<string> {
    //     try {
    //         const absolutePath = path.resolve(filePath);
    //         const svgContent = await fs.readFile(absolutePath, 'utf8');
    //         return svgContent;
    //     } catch (error) {
    //         console.error('Error reading file:', filePath, error);
    //         throw error;
    //     }
    // }
    readSvgFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs.readFile(filePath, 'utf8');
        });
    }
    /**
     * Sanitizes a file name to be a valid TypeScript identifier.
     * @param fileName The original file name.
     * @returns A sanitized version of the file name.
     */
    // private sanitizeFileName(fileName: string): string {
    //         // Implement more robust sanitization logic if necessary
    //         return fileName.replace(/[^a-zA-Z0-9_]/g, '_');
    // }
    sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    writeFiles(iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.writeSvgFile(iconName, svgContent, outputDirectory);
            yield this.writeTypeScriptFile(iconName, svgContent, outputDirectory);
        });
    }
    /**
     * Optimizes SVG content using SVGO.
     * @param svgContent The raw SVG content.
     * @returns The optimized SVG content.
     */
    // private async optimizeSvg(
    //     filePath: string,
    //     svgContent: string
    // ): Promise<string> {
    //     try {
    //         const config = await loadConfig(
    //             path.join(__dirname, '../config/svgo.config.js')
    //         )
    //         const result = await SVGO.optimize(
    //             svgContent,
    //             { path: filePath, ...config } // Add SVGO options if needed
    //         );
    //         return result.data;
    //     } catch (error) {
    //         console.error('Error optimizing SVG:', error);
    //         throw error;
    //     }
    // }
    optimizeSvg(svgContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield (0, svgo_2.loadConfig)(this.svgoConfigPath);
            const result = yield svgo_1.default.optimize(svgContent, Object.assign({}, config));
            return result.data.trim();
        });
    }
    /**
     * Creates a TypeScript file from SVG content.
     * @param filePath The path of the SVG file.
     * @param svgContent The optimized SVG content.
     * @param outputDirectory The directory to output the TypeScript file.
     */
    //  private async writeTypeScriptFile(
    //     filePath: string,
    //     iconName: string,
    //     svgContent: string,
    //     outputDirectory: string
    // ): Promise<void> {
    //     try {
    //         const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
    //         const outputPath = path.join(outputDirectory, `${iconName}.ts`);
    //         await fs.writeFile(outputPath, tsContent);
    //     } catch (error) {
    //         console.error(`Error creating TypeScript file for ${filePath}:`, error);
    //         throw error;
    //     }
    // }
    writeTypeScriptFile(iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const tsContent = `export const icon_${iconName} = \`${svgContent}\`;\n`;
            const outputPath = path.join(outputDirectory, `${iconName}.ts`);
            yield fs.writeFile(outputPath, tsContent);
        });
    }
    /**
     * Writes the SVG content to a file.
     * @param filePath The original file path of the SVG.
     * @param svgContent The SVG content to be written.
     * @param outputDirectory The directory to output the SVG file.
     */
    // private async writeSvgFile(
    //     filePath: string,
    //     iconName: string,
    //     svgContent: string,
    //     outputDirectory: string
    // ): Promise<void> {
    //     try {
    //         const outputPath = path.join(outputDirectory, `${iconName}.svg`);
    //         await fs_extra.outputFile(outputPath, svgContent);
    //         console.log(`SVG file written successfully for ${iconName}`);
    //     } catch (error) {
    //         console.error(`Error writing SVG file for ${iconName}:`, error);
    //         throw error;
    //     }
    // }
    writeSvgFile(iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const outputPath = path.join(outputDirectory, `${iconName}.svg`);
            yield fs.writeFile(outputPath, svgContent);
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
                // await fs_extra.outputFile(outputPath, jsonContent);
                yield fs.writeFile(outputPath, jsonContent);
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
