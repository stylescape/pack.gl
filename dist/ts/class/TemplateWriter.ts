// class/TemplateWriter.ts


// ============================================================================
// Import
// ============================================================================

// import fs from "fs/promises";
import { mkdir, writeFile } from 'fs/promises'; // Correct way to import from 'fs/promises'
import path from "path";
import nunjucks from "nunjucks";
import nunjucksConfig from "../config/nunjucks.config.js"


// ============================================================================
// Classes
// ============================================================================

/**
 * Class designed for rendering and writing HTML or text files from Nunjucks
 * templates. It encapsulates configuration and rendering logic, making it
 * simple to produce files from templates for various uses such as email
 * templates, web pages, or configuration files.
 */
class TemplateWriter {

    // context: {};
    context: Record<string, any>;

    /**
     *  Configuration for the Nunjucks writer compiler.
     */
    // private config: {};
    private config: Record<string, any>;

    /**
     * Default configuration for the TypeScript compiler.
     */
    // private static defaultConfig: any = nunjucksConfig;
    private static defaultConfig: Record<string, any> = nunjucksConfig;

    /**
     * Constructs a TemplateWriter instance with specified settings.
     * @param {string} templatesDir The directory containing Nunjucks templates.
     * @param {object} context Global data object that will be available to all templates.
     * @param {object} customConfig Custom configuration settings for Nunjucks.
     */
     constructor(
        // templatesDir: string,
        // context: {},
        // customConfig: any = {},
        templatesDir: string,
        context: Record<string, any> = {},
        customConfig: Record<string, any> = {}
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
     * Generates content from a Nunjucks template file.
     * @param {string} template The template file name.
     * @returns {Promise<string>} The rendered template as a string.
     * @throws {Error} If there is an error in rendering the template.
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
            throw new Error("Template generation failed");
        }
    }
    // async generateTemplate(template: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         nunjucks.render(template, this.context, (err, result) => {
    //             if (err) {
    //                 console.error(`Error generating template: ${err}`);
    //                 reject(new Error('Template generation failed'));
    //             } else {
    //                 resolve(result);
    //             }
    //         });
    //     });
    // }

    /**
     * Writes the rendered template content to a specified file path.
     * @param {string} template The template file name.
     * @param {string} outputFile The output file path where content will be written.
     * @throws {Error} If there is an error in writing the file.
     */
     async generateToFile(template: string, outputFile: string): Promise<void> {
        try {
            const content = await this.generateTemplate(template);
            const dir = path.dirname(outputFile);

            // Ensure the directory exists
            // await fs.mkdir(dir, { recursive: true });
            await mkdir(dir, { recursive: true });

            // Write the file
            // await fs.writeFile(outputFile, content, "utf-8");
            await writeFile(outputFile, content, 'utf-8');

            console.log(`File written to ${outputFile}`);

        } catch (error) {
            console.error(`Error writing to file: ${error}`);
            throw new Error("File writing failed");
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default TemplateWriter;


// ============================================================================
// Example
// ============================================================================


// import TemplateWriter from "./TemplateWriter";

// const writer = new TemplateWriter("./path/to/templates", { name: "John Doe" });
// writer.generateToFile("emailTemplate.njk", "./output/email.html")
//     .then(() => console.log("Email template has been successfully generated and saved."))
//     .catch(error => console.error("Failed to generate email template:", error));