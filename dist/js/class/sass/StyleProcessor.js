"use strict";
// ============================================================================
// Import
// ============================================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const sass = __importStar(require("sass"));
const postcss_1 = __importDefault(require("postcss"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sass_1 = require("sass"); // Update this path based on the actual source of NodePackageImporter
const postcss_config_expanded_js_1 = __importDefault(require("../../config/postcss.config.expanded.js"));
const postcss_config_compressed_js_1 = __importDefault(require("../../config/postcss.config.compressed.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Class responsible for processing styles, including compiling SCSS and
 * applying PostCSS transformations. It can be configured to output either
 * expanded or compressed CSS, making it flexible for different environments.
 */
class StyleProcessor {
    /**
     * Processes the given CSS with PostCSS based on the provided style option.
     * @param css The CSS string to process.
     * @param styleOption The style option, either "expanded" or "compressed".
     * @returns Processed CSS string.
     */
    processPostCSS(css, styleOption) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = styleOption === "expanded" ? postcss_config_expanded_js_1.default : postcss_config_compressed_js_1.default;
            const result = yield (0, postcss_1.default)(config.plugins).process(css, { from: undefined, map: { inline: false } });
            return result.css;
        });
    }
    /**
     * Ensures that the given directory exists. Creates it if it does not
     * exist.
     * @param dirPath The path of the directory to check and create.
     */
    ensureDirectoryExists(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.promises.mkdir(dirPath, { recursive: true });
            }
            catch (error) {
                if (error instanceof Error) {
                    const nodeError = error;
                    if (nodeError.code !== "EEXIST") {
                        // Rethrow if it"s not a "directory exists" error
                        throw nodeError;
                    }
                }
                else {
                    // Rethrow if it"s not an Error instance
                    throw error;
                }
            }
        });
    }
    /**
     * Compiles SCSS to CSS and processes it using PostCSS.
     * @param inputFile Path to the input SCSS file.
     * @param outputFile Path to the output CSS file.
     * @param styleOption Style option for the output, either "expanded" or
     * "compressed".
     */
    processStyles(inputFile, outputFile, styleOption) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure the output directory exists
                const outputDir = path_1.default.dirname(outputFile);
                yield this.ensureDirectoryExists(outputDir);
                // Compile SCSS to CSS
                const result = yield sass.compileAsync(inputFile, {
                    style: styleOption,
                    importers: [
                        new sass_1.NodePackageImporter()
                    ],
                });
                // Process the compiled CSS with PostCSS
                const processedCss = yield this.processPostCSS(result.css, styleOption);
                // Write the processed CSS to a file
                yield fs_1.promises.writeFile(outputFile, processedCss, "utf-8");
                // Optionally handle source maps
                // ...
            }
            catch (err) {
                console.error(`Error processing styles from ${inputFile}:`, err);
                // Re-throw the error for further handling if necessary
                throw err;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = StyleProcessor;
// ============================================================================
// Example
// ============================================================================
// import StyleProcessor from "./StyleProcessor";
// const styleProcessor = new StyleProcessor();
// const inputFile = "./src/styles/main.scss";
// const outputFile = "./dist/styles/main.css";
// styleProcessor.processStyles(inputFile, outputFile, "compressed")
//     .then(() => console.log("Styles processed successfully."))
//     .catch(error => console.error("Failed to process styles:", error));
