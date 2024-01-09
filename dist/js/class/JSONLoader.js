"use strict";
// class/JSONLoader.ts
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
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
class JSONLoader {
    /**
     * Asynchronously loads JSON data from a file and returns it as an object.
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to an object containing the JSON data.
     */
    async loadJSON(filePath) {
        try {
            const data = await fs_1.promises.readFile(filePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`Error reading JSON file: ${filePath}`, error);
            throw error;
        }
    }
    /**
     * Asynchronously loads all JSON files from a given directory.
     * @param dirPath The path to the directory containing JSON files.
     * @returns A promise that resolves to an array of objects containing the JSON data.
     */
    async loadJSONFromDirectory(dirPath) {
        try {
            const files = await fs_1.promises.readdir(dirPath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            const jsonData = await Promise.all(jsonFiles.map(file => this.loadJSON(path_1.default.join(dirPath, file))));
            return jsonData;
        }
        catch (error) {
            console.error(`Error reading JSON files from directory: ${dirPath}`, error);
            throw error;
        }
    }
    /**
     * Merges an array of objects into a single object.
     * @param objects An array of objects to merge.
     * @returns A single object containing all properties from the input objects.
     */
    async mergeJSONObjects(objects) {
        return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = JSONLoader;
