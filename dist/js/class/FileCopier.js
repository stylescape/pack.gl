"use strict";
// class/FileCopier.ts
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
 * A class for copying files from one location to another.
 */
class FileCopier {
    /**
     * Copies a single file to a specified destination directory.
     * @param {string} srcFile - The path of the source file to copy.
     * @param {string} destDir - The destination directory where the file should be copied.
     * @throws Will throw an error if the file copy operation fails.
     */
    async copyFileToDirectory(srcFile, destDir) {
        try {
            const fileName = path_1.default.basename(srcFile);
            const destFilePath = path_1.default.join(destDir, fileName);
            await fs_1.default.promises.copyFile(srcFile, destFilePath);
            console.log(`File copied from ${srcFile} to ${destFilePath}`);
        }
        catch (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = FileCopier;
