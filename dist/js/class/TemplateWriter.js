"use strict";
// class/TemplateWriter.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================================
// Import
// ============================================================================
// import fs from "fs/promises";
const promises_1 = require("fs/promises"); // Correct way to import from 'fs/promises'
const path_1 = __importDefault(require("path"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const nunjucks_config_js_1 = __importDefault(require("../config/nunjucks.config.js"));
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
    templatesDir, context = {}, customConfig = {}) {
        this.context = context;
        this.config = Object.assign(Object.assign({}, TemplateWriter.defaultConfig), customConfig);
        nunjucks_1.default.configure(templatesDir, this.config);
    }
    /**
     * Generates content from a Nunjucks template file.
     * @param {string} template The template file name.
     * @returns {Promise<string>} The rendered template as a string.
     * @throws {Error} If there is an error in rendering the template.
     */
    generateTemplate(template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return nunjucks_1.default.render(template, this.context);
            }
            catch (error) {
                console.error(`Error generating template: ${error}`);
                // throw error;
                throw new Error("Template generation failed");
            }
        });
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
    generateToFile(template, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.generateTemplate(template);
                const dir = path_1.default.dirname(outputFile);
                // Ensure the directory exists
                // await fs.mkdir(dir, { recursive: true });
                yield (0, promises_1.mkdir)(dir, { recursive: true });
                // Write the file
                // await fs.writeFile(outputFile, content, "utf-8");
                yield (0, promises_1.writeFile)(outputFile, content, 'utf-8');
                console.log(`File written to ${outputFile}`);
            }
            catch (error) {
                console.error(`Error writing to file: ${error}`);
                throw new Error("File writing failed");
            }
        });
    }
}
/**
 * Default configuration for the TypeScript compiler.
 */
// private static defaultConfig: any = nunjucksConfig;
TemplateWriter.defaultConfig = nunjucks_config_js_1.default;
// ============================================================================
// Export
// ============================================================================
exports.default = TemplateWriter;
// ============================================================================
// Example
// ============================================================================
// import TemplateWriter from "./TemplateWriter";
// const writer = new TemplateWriter("./path/to/templates", { name: "John Doe" });
// writer.generateToFile("emailTemplate.njk", "./output/email.html")
//     .then(() => console.log("Email template has been successfully generated and saved."))
//     .catch(error => console.error("Failed to generate email template:", error));
