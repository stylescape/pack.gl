"use strict";
// class/DirectoryCleaner.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const path_1 = require("path");
// ============================================================================
// Classes
// ============================================================================
class DirectoryCleaner {
    /**
     * Recursively deletes all contents of the directory asynchronously.
     * @param dirPath The path to the directory to clean.
     */
    cleanDirectory(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = yield fs_1.promises.readdir(dirPath);
                for (const file of files) {
                    const curPath = path_1.default.join(dirPath, file);
                    const stat = yield fs_1.promises.lstat(curPath);
                    if (stat.isDirectory()) {
                        yield this.cleanDirectory(curPath);
                    }
                    else {
                        yield fs_1.promises.unlink(curPath);
                    }
                }
                yield fs_1.promises.rmdir(dirPath);
            }
            catch (error) {
                console.error(`Error cleaning directory ${dirPath}: ${error}`);
                throw error; // Rethrow the error for further handling if necessary
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryCleaner;
