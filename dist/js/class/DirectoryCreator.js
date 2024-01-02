"use strict";
// class/DirectoryGenerator.ts
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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
/**
 * A class for creating directories.
 */
class DirectoryCreator {
    /**
     * Creates directories at the specified locations asynchronously.
     * @param basePath The base path where directories will be created.
     * @param directories An array of directory paths to create.
     * @description This method iterates over the provided array of directory paths,
     *              creating each directory at the specified location within the base path.
     *              If a directory already exists, it skips creation. This is useful for
     *              setting up a project structure or ensuring necessary directories are
     *              available before performing file operations.
     * @throws Will throw an error if directory creation fails.
     */
    createDirectories(basePath, directories) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const dir of directories) {
                    const dirPath = path_1.default.join(basePath, dir);
                    yield fs_1.promises.mkdir(dirPath, { recursive: true });
                    console.log(`Directory created or already exists: ${dirPath}`);
                }
            }
            catch (error) {
                console.error(`Error creating directories: ${error}`);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryCreator;
