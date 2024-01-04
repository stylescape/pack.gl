"use strict";
// class/FilenameExtractor.ts
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
var path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
class FilenameExtractor {
    /**
     * Extracts the filename without its extension from a file path.
     * @param filePath The full path of the file.
     * @returns The filename without its extension.
     */
    getFilenameWithoutExtension(filePath) {
        return path_1.default.basename(filePath, path_1.default.extname(filePath));
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = FilenameExtractor;
