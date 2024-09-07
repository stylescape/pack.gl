"use strict";
// class/JavaScriptMinifier.ts
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
const terser_1 = require("terser");
const fs_1 = require("fs");
const terser_config_js_1 = __importDefault(require("../config/terser.config.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Facilitates the minification of JavaScript files using the Terser library.
 * This class allows for flexible configuration of minification settings and
 * aims to produce optimized output files that are significantly reduced in
 * size.
 */
class JavaScriptMinifier {
    /**
     * Constructs an instance with merged configuration of default and
     * optionally provided custom settings.
     *
     * @param {any} customConfig Optional. Custom configuration object to
     * override or extend the default Terser options.
     */
    constructor(customConfig = {}) {
        this.config = Object.assign(Object.assign({}, JavaScriptMinifier.defaultConfig), customConfig);
    }
    /**
     * Minifies a JavaScript file using the configured Terser settings.
     *
     * @param {string} inputPath Path to the input JavaScript file.
     * @param {string} outputPath Path where the minified file will be saved.
     * @returns {Promise<void>} A promise that resolves when the minification
     * process is complete, or rejects with an error.
     * @throws {Error} An error is thrown if there are issues reading the
     * input file, the minification fails, or the output file cannot be written.
     */
    minifyFile(inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the input file
                const inputCode = yield fs_1.promises.readFile(inputPath, "utf8");
                // Minify the file using Terser
                const result = yield (0, terser_1.minify)(inputCode, this.config);
                // If minification is successful, write the output
                if (result.code) {
                    yield fs_1.promises.writeFile(outputPath, result.code);
                }
                else {
                    throw new Error("Minification resulted in empty output.");
                }
            }
            catch (error) {
                console.error(`Error minifying JavaScript file ${inputPath}:`, error);
                throw error;
            }
        });
    }
}
/**
 * Default configuration for the Terser minification, loaded from an
 * external configuration file.
 */
JavaScriptMinifier.defaultConfig = terser_config_js_1.default;
// ============================================================================
// Export
// ============================================================================
exports.default = JavaScriptMinifier;
// ============================================================================
// Example
// ============================================================================
// import JavaScriptMinifier from "./JavaScriptMinifier";
// const minifier = new JavaScriptMinifier();
// const inputPath = "./path/to/source/file.js";
// const outputPath = "./path/to/minified/file.min.js";
// minifier.minifyFile(inputPath, outputPath)
//     .then(() => console.log("JavaScript file has been minified successfully."))
//     .catch(error => console.error("Failed to minify JavaScript file:", error));
