"use strict";
// class/FontGenerator.ts
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
const fantasticon_1 = require("fantasticon");
const fantasticon_config_js_1 = __importDefault(require("../config/fantasticon.config.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Handles the generation of font files from SVG icons or other vector graphic
 * formats. This class utilizes the "fantasticon" library to convert a
 * directory of SVG files into various font formats. Users can customize the
 * font generation process via configuration options.
 */
class FontGenerator {
    /**
     * Constructs an instance with merged configuration of default and custom options.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    /**
     * Constructs an instance of FontGenerator, merging default configuration with optional custom settings.
     *
     * @param {RunnerOptions} customConfig Optional custom configuration to override the defaults.
     */
    constructor(
    // customConfig: any = {},
    customConfig = {}) {
        this.config = Object.assign(Object.assign({}, FontGenerator.defaultConfig), customConfig);
    }
    /**
     * Generates font assets from SVG icons located in the specified source directory,
     * and outputs them to the specified output directory.
     *
     * @param {string} sourceDirectory The directory containing SVG files to be converted.
     * @param {string} outputDirectory The directory where the generated font files will be stored.
     * @param {Partial<RunnerOptions>} options Additional options to customize the font generation process.
     */
    generateFonts(sourceDirectory, outputDiectory, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = Object.assign(Object.assign(Object.assign({}, this.config), { 
                // RunnerMandatoryOptions
                inputDir: sourceDirectory, outputDir: outputDiectory }), options);
            try {
                yield (0, fantasticon_1.generateFonts)(config);
                console.log("Fonts generated successfully.");
            }
            catch (error) {
                console.error("Error generating fonts:", error);
            }
        });
    }
}
/**
 * Default configuration derived from an external configuration file.
 */
//  private static defaultConfig: any = fantasticonConfig;
FontGenerator.defaultConfig = fantasticon_config_js_1.default;
// ============================================================================
// Export
// ============================================================================
exports.default = FontGenerator;
// ============================================================================
// Example
// ============================================================================
// import FontGenerator from "./FontGenerator";
// const fontGenerator = new FontGenerator();
// const sourceDirectory = "./path/to/svg/icons";
// const outputDirectory = "./path/to/output/fonts";
// fontGenerator.generateFonts(sourceDirectory, outputDirectory)
//     .then(() => console.log("Font generation completed successfully."))
//     .catch(error => console.error("Failed to generate fonts:", error));
