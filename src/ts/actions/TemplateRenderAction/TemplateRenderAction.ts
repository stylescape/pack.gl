// ============================================================================
// Imports
// ============================================================================

import { mkdir, writeFile } from "fs/promises";
import { glob } from "glob";
import nunjucks from "nunjucks";
import path from "path";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";
import nunjucksConfig from "./nunjucks.config.js";

// ============================================================================
// Classes
// ============================================================================

export class TemplateRenderAction extends Action {
    async execute(options: ActionOptionsType): Promise<void> {
        const {
            templatesDir = "./templates",
            outputDir = "./dist",
            templates = [],
            context = {},
            renderAllFromDir = false,
            customConfig = {},
        } = options;

        const config = { ...nunjucksConfig, ...customConfig };
        nunjucks.configure(templatesDir, config);

        try {
            if (renderAllFromDir) {
                this.logInfo(
                    `Auto-rendering all templates from ${templatesDir}...`,
                );
                const templateFiles = await glob("**/*.jinja", {
                    cwd: templatesDir,
                });

                for (const templateRelPath of templateFiles) {
                    const outputFile = path.join(
                        outputDir,
                        templateRelPath.replace(/\.jinja$/, ""),
                    );
                    await this.renderTemplate(
                        templateRelPath,
                        outputFile,
                        context,
                        templatesDir,
                    );
                }
            } else {
                if (!Array.isArray(templates) || templates.length === 0) {
                    throw new Error(
                        "Option 'templates' must be provided if 'renderAllFromDir' is false.",
                    );
                }

                for (const { template, outputFile } of templates) {
                    await this.renderTemplate(
                        template,
                        outputFile,
                        context,
                        templatesDir,
                    );
                }
            }

            this.logInfo("✓ All templates rendered successfully.");
        } catch (error) {
            this.logError("Error rendering templates.", error);
            throw error;
        }
    }

    private async renderTemplate(
        template: string,
        outputFile: string,
        context: Record<string, any>,
        templatesDir: string,
    ): Promise<void> {
        this.logInfo(`Rendering: ${template} → ${outputFile}`);

        const content = nunjucks.render(template, context);
        const dir = path.dirname(outputFile);
        await mkdir(dir, { recursive: true });
        await writeFile(outputFile, content, "utf-8");

        this.logInfo(`✓ Rendered: ${outputFile}`);
    }

    describe(): string {
        return "Renders one or many Nunjucks templates using a shared context. Supports folder-wide auto-rendering.";
    }
}

// ============================================================================
// Export
// ============================================================================

export default TemplateRenderAction;
