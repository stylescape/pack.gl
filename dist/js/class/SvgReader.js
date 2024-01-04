"use strict";
// class/SvgReader.ts
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
// ============================================================================
// Classes
// ============================================================================
class SvgReader {
    /**
     * Reads the content of an SVG file asynchronously.
     * @param filePath The path to the SVG file.
     * @returns A promise that resolves to the content of the SVG file.
     */
    async readSVG(filePath) {
        try {
            const data = await fs_1.promises.readFile(filePath, 'utf-8');
            return data;
        }
        catch (error) {
            console.error(`Error reading SVG file: ${filePath}`, error);
            throw error; // Rethrow the error for further handling if necessary
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgReader;
