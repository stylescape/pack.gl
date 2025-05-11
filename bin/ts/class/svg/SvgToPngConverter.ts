// ============================================================================
// Import
// ============================================================================

import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";

// ============================================================================
// Classes
// ============================================================================

/**
 * A utility class for converting SVG images to PNG format.
 * This class uses `resvg-js` for image conversion and `jsdom` to manipulate
 * SVG elements.
 */
class SvgToPngConverter {
    // Methods
    // ========================================================================

    /**
     * Converts SVG content to a PNG file.
     * Optionally resizes the image to the specified width and height.
     *
     * @param {string} svgContent The SVG content to be converted.
     * @param {string} outputPath The filesystem path where the PNG should be
     * saved.
     * @param {number} [width] Optional width to resize the resulting PNG.
     * @param {number} [height] Optional height to resize the resulting PNG.
     * @throws {Error} Throws an error if the conversion process fails.
     */
    async convert(
        svgContent: string,
        outputPath: string,
        width?: number,
        height?: number,
    ): Promise<void> {
        try {
            // Ensure the output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Parse the SVG and optionally modify width and height
            const dom = new JSDOM(svgContent);
            const svgElement = dom.window.document.querySelector("svg");

            if (!svgElement) {
                throw new Error("Invalid SVG content");
            }

            if (width) svgElement.setAttribute("width", width.toString());
            if (height) svgElement.setAttribute("height", height.toString());

            const updatedSvgContent = svgElement.outerHTML;

            // Convert SVG to PNG using resvg
            const resvg = new Resvg(updatedSvgContent);
            const pngBuffer = resvg.render().asPng();

            fs.writeFileSync(outputPath, pngBuffer);

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
// const svgContent = '<svg height="100" width="100">...</svg>';
// const outputPath = "./output/image.png";

// converter.convert(svgContent, outputPath, 100, 100)
//     .then(() => console.log("SVG has been successfully converted to PNG."))
//     .catch(error => console.error("Failed to convert SVG to PNG:", error));
