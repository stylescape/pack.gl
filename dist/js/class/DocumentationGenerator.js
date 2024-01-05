"use strict";
// class/DocumentationGenerator.ts
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
var child_process_1 = require("child_process");
var util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
// ============================================================================
// Classes
// ============================================================================
class DocumentationGenerator {
    constructor(sourcePath, outputPath, generatorCommand) {
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
        this.generatorCommand = generatorCommand;
    }
    /**
     * Generates documentation based on the provided configuration.
     * @returns A promise that resolves when the documentation generation is complete.
     */
    async generate() {
        try {
            // Here, you can add any pre-generation logic if necessary
            // Execute the documentation generation command
            const { stdout, stderr } = await execAsync(`${this.generatorCommand} -c ${this.sourcePath} -o ${this.outputPath}`);
            if (stderr) {
                throw new Error(`Documentation generation failed: ${stderr}`);
            }
            console.log(stdout);
            console.log('Documentation generated successfully.');
            // Here, you can add any post-generation logic if necessary
        }
        catch (error) {
            console.error('Error occurred while generating documentation:', error);
            throw error;
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DocumentationGenerator;
// Usage Example
// To use the DocumentationGenerator class, you would instantiate it with the path to your source files, the output directory for the documentation, and the command for your documentation tool. For instance, using JSDoc:
// import DocumentationGenerator from './DocumentationGenerator';
// const sourcePath = './src';
// const outputPath = './docs';
// const generatorCommand = 'jsdoc'; // Ensure JSDoc is installed and available in your environment
// const docGenerator = new DocumentationGenerator(sourcePath, outputPath, generatorCommand);
// docGenerator.generate()
//     .then(() => console.log('Documentation generation completed.'))
//     .catch(error => console.error(error));
