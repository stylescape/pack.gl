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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
// ============================================================================
// Classes
// ============================================================================
/**
 * Handles reading SVG files from the filesystem. This class can be used in applications
 * that need to process or analyze SVG content programmatically, such as in graphics
 * processing tools, web servers, or content management systems.
 */
class SvgReader {
    /**
     * Reads the content of an SVG file asynchronously.
     * This method is useful for applications that need to load and manipulate SVG graphics,
     * perhaps for rendering or further processing.
     *
     * @param filePath The path to the SVG file.
     * @returns A promise that resolves to the content of the SVG file as a string.
     * @throws Throws an error if the file cannot be read, which might occur due to issues
     *         like file not existing or access permissions.
     */
    readSVG(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs_1.promises.readFile(filePath, "utf-8");
                return data;
            }
            catch (error) {
                console.error(`Error reading SVG file: ${filePath}`, error);
                throw error; // Rethrow the error for further handling if necessary
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = SvgReader;
// ============================================================================
// Example
// ============================================================================
// import SvgReader from "./SvgReader";
// const reader = new SvgReader();
// reader.readSVG("path/to/your/svg/file.svg")
//     .then(content => {
//         console.log("SVG Content:", content);
//     })
//     .catch(error => {
//         console.error("Failed to read SVG:", error);
//     });
