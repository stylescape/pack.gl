// ============================================================================
// Import
// ============================================================================

import { Canvas, createCanvas } from "canvas";
import { Canvg } from "canvg";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";

// ============================================================================
// Utilities
// ============================================================================

/**
 * Wraps the canvas.getContext call with a safe cast for canvg compatibility.
 * Avoids polluting the main logic with unsafe type assertions.
 */
function getSafeRenderingContext(canvas: Canvas) {
    return canvas.getContext("2d");
}

// ============================================================================
// Classes
// ============================================================================

/**
 * A utility class for converting SVG images to PNG format.
 * This class uses `canvg` and `canvas` for image rendering, and `jsdom`
 * to manipulate SVG elements.
 */
class SvgToPngConverter {
    /**
     * Converts SVG content to a PNG file.
     * Optionally resizes the image to the specified width and height.
     *
     * @param svgContent The SVG content to be converted.
     * @param outputPath The filesystem path where the PNG should be saved.
     * @param width Optional width to resize the resulting PNG.
     * @param height Optional height to resize the resulting PNG.
     * @throws {Error} Throws an error if the conversion process fails.
     */
    async convert(
        svgContent: string,
        outputPath: string,
        width?: number,
        height?: number,
    ): Promise<void> {
        try {
            // Parse SVG and optionally update dimensions
            const dom = new JSDOM(svgContent);
            const svgElement = dom.window.document.querySelector("svg");

            if (!svgElement) {
                throw new Error("Invalid SVG content");
            }

            const w =
                width ||
                parseInt(svgElement.getAttribute("width") || "800", 10);
            const h =
                height ||
                parseInt(svgElement.getAttribute("height") || "600", 10);

            svgElement.setAttribute("width", w.toString());
            svgElement.setAttribute("height", h.toString());

            const updatedSvg = svgElement.outerHTML;

            // Create a canvas and draw the SVG
            const canvas = createCanvas(w, h);
            const ctx = getSafeRenderingContext(canvas);

            const canvg = await Canvg.from(ctx as any, updatedSvg);
            await canvg.render();

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(outputPath, buffer);

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
