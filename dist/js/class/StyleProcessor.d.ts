/// <reference types="node" />
import postcss from 'postcss';
import fs from 'fs';
/**
 * Class responsible for processing styles, including compiling SCSS and
 * applying PostCSS transformations.
 */
declare class StyleProcessor {
    /**
     * Processes the given CSS with PostCSS based on the provided style option.
     * @param css The CSS string to process.
     * @param styleOption The style option, either 'expanded' or 'compressed'.
     * @returns Processed CSS string.
     */
    processPostCSS(css: string, styleOption: 'expanded' | 'compressed'): Promise<postcss.Result<postcss.Root>>;
    /**
     * Ensures that the given directory exists. Creates it if it does not exist.
     * @param dirPath - The path of the directory to check and create.
     */
    private ensureDirectoryExists;
    /**
     * Compiles SCSS to CSS and processes it using PostCSS.
     * @param inputFile Path to the input SCSS file.
     * @param outputFile Path to the output CSS file.
     * @param styleOption Style option for the output.
     */
    processStyles(inputFile: string, outputFile: fs.PathOrFileDescriptor, styleOption: 'expanded' | 'compressed'): Promise<void>;
}
export default StyleProcessor;
