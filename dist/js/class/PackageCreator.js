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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
/**
 * A class for creating a package.json file for a project.
 */
class PackageCreator {
    /**
     * Initializes a new instance of the PackageCreator class.
     * @param {PackageJson} packageJson - The content to be written into package.json.
     */
    constructor(packageJson) {
        this.packageJson = packageJson;
    }
    /**
     * Creates a package.json file in the specified directory.
     * @param {string} outputDir - The directory where package.json will be created.
     */
    async createPackageJson(outputDir) {
        const filePath = path_1.default.join(outputDir, 'package.json');
        const data = JSON.stringify(this.packageJson, null, 2);
        fs_1.default.writeFileSync(filePath, data, 'utf-8');
        console.log(`package.json created at ${filePath}`);
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = PackageCreator;
