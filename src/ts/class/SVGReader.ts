// class/SvgReader.ts


// ============================================================================
// Import
// ============================================================================

import { promises as fs } from "fs";


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
    async readSVG(filePath: string): Promise<string> {
        try {
            const data = await fs.readFile(filePath, "utf-8");
            return data;
        } catch (error) {
            console.error(`Error reading SVG file: ${filePath}`, error);
            throw error; // Rethrow the error for further handling if necessary
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default SvgReader;


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