"use strict";
// class/DirectoryScanner.ts
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
// ============================================================================
// Classes
// ============================================================================
class DirectoryScanner {
    /**
     * Scans a directory and returns a list of file paths.
     * Can optionally scan directories recursively.
     * @param dirPath The directory to scan.
     * @param recursive Whether to scan directories recursively.
     * @returns A promise that resolves to an array of file paths.
     */
    async scanDirectory(dirPath, recursive = false) {
        try {
            const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
            const files = await Promise.all(entries.map(async (entry) => {
                const resolvedPath = path_1.default.resolve(dirPath, entry.name);
                return entry.isDirectory() && recursive
                    ? this.scanDirectory(resolvedPath, true)
                    : resolvedPath;
            }));
            return files.flat();
        }
        catch (error) {
            console.error(`Error scanning directory: ${dirPath}`, error);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryScanner;
