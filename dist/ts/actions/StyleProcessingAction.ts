import { ActionOptionsType } from '../types/ActionOptionsType';
import * as sass from 'sass';
import postcss from 'postcss';
import { promises as fs } from 'fs';
import path from 'path';
import { NodePackageImporter } from 'sass'; // Update the path based on your project setup

// Assuming the PostCSS configurations are available at the given paths
import postcssConfigExpanded from '../config/postcss.config.expanded.js';
import postcssConfigCompressed from '../config/postcss.config.compressed.js';
import { BaseStepAction } from '../core/BaseStepAction';


/**
 * StyleProcessingAction is a step action responsible for processing styles,
 * including compiling SCSS and applying PostCSS transformations. It supports
 * expanded and compressed output styles based on the provided configuration.
 */
export class StyleProcessingAction extends BaseStepAction {

    /**
     * Executes the style processing action.
     * @param options - The options specific to style processing, including input/output file paths and style format.
     * @returns A Promise that resolves when the styles are processed successfully, or rejects with an error if the action fails.
     */
    async execute(
        options: ActionOptionsType
    ): Promise<void> {

        const inputFile = options.inputFile as string;
        const outputFile = options.outputFile as string;
        const styleOption = options.styleOption as 'expanded' | 'compressed';

        if (!inputFile || !outputFile || !styleOption) {
            throw new Error('Missing required options: inputFile, outputFile, or styleOption.');
        }

        this.log(`Processing styles from ${inputFile} to ${outputFile} with ${styleOption} style.`);

        try {
            // Ensure the output directory exists
            const outputDir = path.dirname(outputFile);
            await this.ensureDirectoryExists(outputDir);

            // Compile SCSS to CSS
            const result = await sass.compileAsync(inputFile, { 
                style: styleOption,
                importers: [
                    new NodePackageImporter(),
                ],
            });

            // Process the compiled CSS with PostCSS
            const processedCss = await this.processPostCSS(result.css, styleOption);

            // Write the processed CSS to a file
            await fs.writeFile(outputFile, processedCss, 'utf-8');

            this.log(`Styles processed successfully from ${inputFile} to ${outputFile}.`);

        } catch (error) {
            this.logError(`Error processing styles from ${inputFile}: ${error}`);
            throw error;
        }
    }

    /**
     * Processes the given CSS with PostCSS based on the provided style option.
     * @param css - The CSS string to process.
     * @param styleOption - The style option, either 'expanded' or 'compressed'.
     * @returns Processed CSS string.
     */
    private async processPostCSS(css: string, styleOption: 'expanded' | 'compressed'): Promise<string> {
        const config = styleOption === 'expanded' ? postcssConfigExpanded : postcssConfigCompressed;
        const result = await postcss(config.plugins).process(css, { from: undefined, map: { inline: false } });
        return result.css;
    }

    /**
     * Ensures that the given directory exists, creating it if it does not.
     * @param dirPath - The path of the directory to check and create.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error instanceof Error) {
                const nodeError = error as NodeJS.ErrnoException;
                if (nodeError.code !== 'EEXIST') {
                    throw nodeError;
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return 'Processes SCSS files into CSS, applying PostCSS transformations for expanded or compressed outputs.';
    }
}