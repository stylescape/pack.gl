"use strict";
// ============================================================================
// Import
// ============================================================================
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
const svg_sprite_1 = __importDefault(require("svg-sprite"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const svgsprite_config_js_1 = __importDefault(require("../config/svgsprite.config.js"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Facilitates the generation of SVG sprites from individual SVG files.
 * This class uses svg-sprite to compile multiple SVG files into a single sprite sheet,
 * which is useful for efficiently managing and using graphics in web projects.
 */
class SvgSpriteGenerator {
    // private static defaultConfig: CompilerOptions = tsConfig;
    /**
     * Constructs an instance with a merged configuration of default settings and optional customizations.
     * @param {svgSprite.Config} customConfig - Optional custom configuration object for svg-sprite.
     */
    constructor(customConfig = {}) {
        this.config = Object.assign(Object.assign({}, SvgSpriteGenerator.defaultConfig), customConfig);
    }
    /**
     * Generates an SVG sprite from SVG files in a specified directory.
     * @param {string} sourceDir - Directory containing source SVG files.
     * @param {string} outputDir - Directory where the generated sprite will be saved.
     */
    generateSprite(sourceDir, outputDir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = fs_1.default.readdirSync(sourceDir);
                const sprite = new svg_sprite_1.default(this.config);
                files.forEach(file => {
                    if (path_1.default.extname(file) === ".svg") {
                        const svgPath = path_1.default.resolve(sourceDir, file);
                        const content = fs_1.default.readFileSync(svgPath, "utf8");
                        sprite.add(svgPath, null, content);
                    }
                });
                sprite.compile((error, result) => {
                    if (error) {
                        throw error;
                    }
                    for (const mode in result) {
                        for (const resource in result[mode]) {
                            const outputPath = path_1.default.resolve(outputDir, result[mode][resource].path);
                            fs_1.default.mkdirSync(path_1.default.dirname(outputPath), { recursive: true });
                            fs_1.default.writeFileSync(outputPath, result[mode][resource].contents);
                        }
                    }
                });
            }
            catch (err) {
                console.error("Error generating SVG sprite:", err);
            }
        });
    }
}
/**
 * Default configuration for the TypeScript compiler.
 */
SvgSpriteGenerator.defaultConfig = svgsprite_config_js_1.default;
// ============================================================================
// Export
// ============================================================================
exports.default = SvgSpriteGenerator;
// ============================================================================
// Example
// ============================================================================
// import SvgSpriteGenerator from "./SvgSpriteGenerator";
// const spriteGenerator = new SvgSpriteGenerator();
// const sourceDirectory = "path/to/source/svg/files";
// const outputDirectory = "path/to/output/sprites";
// spriteGenerator.generateSprite(sourceDirectory, outputDirectory)
//     .then(() => console.log("SVG sprite has been successfully generated."))
//     .catch(error => console.error("Failed to generate SVG sprite:", error));
