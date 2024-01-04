"use strict";
// function/readPackageJson.ts
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
// Functions
// ============================================================================
/**
 * Reads and parses the package.json file.
 * @param packageJsonPath - The path to the package.json file.
 * @returns The parsed package.json object.
 */
async function readPackageJson(packageJsonPath) {
    const fullPath = path_1.default.resolve(packageJsonPath);
    const fileContent = await promises_1.default.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent);
}
// ============================================================================
// Export
// ============================================================================
exports.default = readPackageJson;
