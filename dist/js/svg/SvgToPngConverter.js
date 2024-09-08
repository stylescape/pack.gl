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
const sharp_1 = __importDefault(require("sharp"));
const jsdom_1 = require("jsdom");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
/**
 * A utility class for converting SVG images to PNG format. This class uses the `sharp` library
 * for image conversion and `jsdom` to manipulate SVG elements.
 */
class SvgToPngConverter {
    /**
     * Converts SVG content to a PNG file.
     * Optionally resizes the image to the specified width and height.
     *
     * @param {string} svgContent The SVG content to be converted.
     * @param {string} outputPath The filesystem path where the PNG should be saved.
     * @param {number} [width] Optional width to resize the resulting PNG.
     * @param {number} [height] Optional height to resize the resulting PNG.
     * @throws {Error} Throws an error if the conversion process fails.
     */
    convert(svgContent, outputPath, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure the output directory exists
                const outputDir = path_1.default.dirname(outputPath);
                if (!fs_1.default.existsSync(outputDir)) {
                    fs_1.default.mkdirSync(outputDir, { recursive: true });
                }
                // Create a JSDOM instance to parse the SVG
                const dom = new jsdom_1.JSDOM(svgContent);
                const svgElement = dom.window.document.querySelector("svg");
                if (!svgElement) {
                    throw new Error("Invalid SVG content");
                }
                if (width) {
                    svgElement.setAttribute("width", width.toString());
                }
                if (height) {
                    svgElement.setAttribute("height", height.toString());
                }
                // Serialize the updated SVG content
                const updatedSvgContent = svgElement.outerHTML;
                // Convert SVG to PNG using Sharp
                const pngBuffer = yield (0, sharp_1.default)(Buffer.from(updatedSvgContent)).png().toBuffer();
                yield (0, sharp_1.default)(pngBuffer).toFile(outputPath);
                console.log(`PNG file has been saved to ${outputPath}`);
            }
            catch (error) {
                console.error(`Error converting SVG to PNG: ${error}`);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgToPngConverter;
// ============================================================================
// Example
// ============================================================================
// import SvgToPngConverter from "./SvgToPngConverter";
// const converter = new SvgToPngConverter();
// const svgContent = "<svg height="100" width="100">...</svg>";
// const outputPath = "./output/image.png";
// converter.convert(svgContent, outputPath, 100, 100)
//     .then(() => console.log("SVG has been successfully converted to PNG."))
//     .catch(error => console.error("Failed to convert SVG to PNG:", error));
