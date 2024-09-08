// ============================================================================
// Import
// ============================================================================

import sharp from "sharp";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";


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
    async convert(
        svgContent: string,
        outputPath: string,
        width?: number,
        height?: number
    ): Promise<void> {
        try {

            // Ensure the output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Create a JSDOM instance to parse the SVG
            const dom = new JSDOM(svgContent);
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
            const pngBuffer = await sharp(
                Buffer.from(updatedSvgContent)
            ).png().toBuffer();
            await sharp(pngBuffer).toFile(outputPath);

            console.log(`PNG file has been saved to ${outputPath}`);

        } catch (error) {
            console.error(`Error converting SVG to PNG: ${error}`);
            throw error;
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default SvgToPngConverter;


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
