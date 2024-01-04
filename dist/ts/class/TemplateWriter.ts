// class/TemplateWriter.ts

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

import fs from 'fs/promises';
import path from 'path';
import nunjucks from 'nunjucks';
import nunjucksConfig from "../config/nunjucks.config.js"


// ============================================================================
// Classes
// ============================================================================

class TemplateWriter {

    context: {};

    /**
     *  Configuration for the Nunjucks writer compiler.
     */
    private config: {};

    /**
     * Default configuration for the TypeScript compiler.
     */
    private static defaultConfig: any = nunjucksConfig;

    /**
     * Constructs a TemplateWriter instance.
     * @param templatesDir - Directory for Nunjucks templates.
     */
     constructor(
        templatesDir: string,
        context: {},
        customConfig: any = {},
    ) {
        this.context = context;
        this.config = {
            ...TemplateWriter.defaultConfig,
            ...customConfig
        };
        nunjucks.configure(
            templatesDir,
            this.config,
        );
    }

    /**
     * Generates a template using the provided template file and context.
     * @param template - The template file name.
     * @returns The rendered template as a string.
     */
    async generateTemplate(template: string): Promise<string> {
        try {
            return nunjucks.render(
                template,
                this.context,
            );
        } catch (error) {
            console.error(`Error generating template: ${error}`);
            // throw error;
            throw new Error('Template generation failed');
        }
    }

    /**
     * Writes the rendered template content to a file.
     * @param template - The template file name.
     * @param outputFile - The output file path.
     */
     async generateToFile(template: string, outputFile: string): Promise<void> {
        try {
            const content = await this.generateTemplate(template);
            const dir = path.dirname(outputFile);
            // Ensure the directory exists
            await fs.mkdir(dir, { recursive: true });
            // Write the file
            await fs.writeFile(outputFile, content, 'utf-8');
        } catch (error) {
            console.error(`Error writing to file: ${error}`);
            throw new Error('File writing failed');
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default TemplateWriter;
