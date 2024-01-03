"use strict";
// function/SvgPackager.ts
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
var NpmCommandRunner_js_1 = __importDefault(require("../class/NpmCommandRunner.js"));
// ============================================================================
// Constants
// ============================================================================
const runner = new NpmCommandRunner_js_1.default();
// ============================================================================
// Functions
// ============================================================================
/**
 * Installs a list of specified npm packages.
 * This function automates the process of installing multiple npm packages,
 * logging the progress and any errors that may occur during the installation.
 *
 * It uses the NpmCommandRunner class to run npm install commands for each package.
 * Each package is installed with the latest version and saved as a development dependency.
 */
async function gl_installer() {
    const packages = [
        'pack.gl',
        'unit.gl',
        'hue.gl',
        'page.gl',
        'grid.gl',
        'block.gl',
        'deep.gl',
        'icon.gl',
        'loop.gl',
    ];
    try {
        for (const pkg of packages) {
            console.log(`Running npm install for ${pkg}...`);
            const output = await runner.runCommand(`install ${pkg}@latest --save-dev`);
            console.log(output);
        }
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = gl_installer;
