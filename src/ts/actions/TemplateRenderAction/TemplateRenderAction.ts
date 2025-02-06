// ============================================================================
// Imports
// ============================================================================

import { mkdir, writeFile } from "fs/promises";
import nunjucks from "nunjucks";
import path from "path";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";
import nunjucksConfig from "./nunjucks.config.js";

// ============================================================================
// Classes
// ============================================================================

/**
 * TemplateRenderAction is responsible for rendering and writing multiple files
 * from Nunjucks templates in a single action. It allows batch generation of
 * output files based on a shared template context.
 */
export class TemplateRenderAction extends Action {
    /**
     * Executes the template rendering process for multiple templates.
     *
     * @param options - The options specifying the template directory,
     * template-output mapping, and rendering context.
     * @returns A Promise that resolves when all templates have been rendered.
     * @throws {Error} Throws an error if template processing fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const {
            templatesDir = "./templates",
            templates = [],
            context = {},
            customConfig = {},
        } = options;

        if (!Array.isArray(templates) || templates.length === 0) {
            throw new Error(
                "Invalid options: 'templates' must be an array containing template-output pairs."
            );
        }

        this.logInfo(`Rendering ${templates.length} templates...`);

        try {
            // Merge Nunjucks configurations
            const config = { ...nunjucksConfig, ...customConfig };
            nunjucks.configure(templatesDir, config);

            // Render each template and save to its corresponding output path
            for (const { template, outputFile } of templates) {
                if (!template || !outputFile) {
                    throw new Error(
                        `Invalid template entry: ${JSON.stringify({
                            template,
                            outputFile,
                        })}`
                    );
                }

                this.logInfo(`Rendering: ${template} → ${outputFile}`);

                // Render template content
                const content = nunjucks.render(template, context);

                // Ensure the output directory exists
                const dir = path.dirname(outputFile);
                await mkdir(dir, { recursive: true });

                // Write the rendered template to file
                await writeFile(outputFile, content, "utf-8");

                this.logInfo(`✓ Successfully rendered: ${outputFile}`);
            }

            this.logInfo("All templates rendered successfully.");
        } catch (error) {
            this.logError("Error rendering templates.", error);
            throw error;
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Renders multiple Nunjucks templates into files using a shared context.";
    }
}

// ============================================================================
// Export
// ============================================================================

export default TemplateRenderAction;
