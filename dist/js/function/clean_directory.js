"use strict";
// config/fantasticon.config.ts
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
var DirectoryCleaner_js_1 = __importDefault(require("../class/DirectoryCleaner.js"));
var StylizedLogger_js_1 = __importDefault(require("../class/StylizedLogger.js"));
// ============================================================================
// Constants
// ============================================================================
const directoryCleaner = new DirectoryCleaner_js_1.default();
const logger = new StylizedLogger_js_1.default();
// ============================================================================
// Functions
// ============================================================================
/**
 * Cleans a specified directory and logs the process.
 * @param directoryPath - The path of the directory to clean.
 */
async function cleanDirectory(directoryPath) {
    try {
        logger.header('Clean Directories');
        await directoryCleaner.cleanDirectory(directoryPath);
        logger.body(`Directory cleaned: ${directoryPath}`);
    }
    catch (error) {
        logger.error(`Error cleaning directory: ${error}`);
        throw error; // Rethrow the error for further handling if necessary
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = cleanDirectory;
// Usage example
// cleanAndLogDirectory(CONFIG.path.dist)
//     .then(() => console.log('Directory cleaning completed.'))
//     .catch(error => console.error(error));
