"use strict";
// class/PackageCreator.ts
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
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var package_config_js_1 = __importDefault(require("../config/package.config.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * A class for creating a package.json file for a project.
 */
class PackageCreator {
    // private config: ts.CompilerOptions;
    // private config: { [key: symbol]: any};
    /**
     * Default configuration for Package.json.
     */
    static { this.defaultConfig = package_config_js_1.default; }
    /**
     * Initializes a new instance of the PackageCreator class.
     * @param {PackageJson} customConfig - The content to be written into package.json.
     */
    constructor(customConfig = {}) {
        let newConfig = {
            // Populate with necessary fields from packageData
            name: customConfig.name,
            version: customConfig.version,
            description: customConfig.description,
            keywords: customConfig.keywords,
            license: customConfig.license,
            homepage: customConfig.homepage,
            // main: 'index.js',
            dependencies: customConfig.dependencies
        };
        this.config = {
            ...PackageCreator.defaultConfig,
            ...newConfig
        };
    }
    /**
     * Creates a package.json file in the specified directory.
     * Creates the directory if it does not exist.
     * @param outputDir - The directory where package.json will be created.
     */
    async createPackageJson(outputDir) {
        const filePath = path_1.default.join(outputDir, 'package.json');
        const data = JSON.stringify(this.config, null, 2);
        try {
            // Ensure the output directory exists
            await this.ensureDirectoryExists(outputDir);
            // Write the package.json file
            await promises_1.default.writeFile(filePath, data, 'utf-8');
            console.log(`package.json created at ${filePath}`);
        }
        catch (error) {
            console.error(`Error creating package.json: ${error}`);
            throw error;
        }
    }
    /**
     * Ensures that the given directory exists. Creates it if it does not exist.
     * @param dirPath - The path of the directory to check and create.
     */
    async ensureDirectoryExists(dirPath) {
        try {
            await promises_1.default.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            // Check if error is an instance of NodeJS.ErrnoException
            if (error instanceof Error && error.code !== 'EEXIST') {
                throw error; // Rethrow if it's not a 'directory exists' error
            }
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = PackageCreator;
