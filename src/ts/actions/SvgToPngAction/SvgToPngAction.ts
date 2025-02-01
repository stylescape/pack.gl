// ============================================================================
// Imports
// ============================================================================

import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import sharp from "sharp";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";


// ============================================================================
// Classes
// ============================================================================

/**
 * SvgToPngAction converts SVG content to PNG format.
 * Uses `sharp` for conversion and `jsdom` for SVG element manipulation.
 */
export class SvgToPngAction extends Action {

    // Methods
    // ========================================================================

    /**
     * Executes the SVG-to-PNG conversion process.
     * @param options - Options including SVG content, output path, width,
     * and height.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { svgContent, outputPath, width, height } = options;

        if (!svgContent || !outputPath) {
            throw new Error(
                "Both 'svgContent' and 'outputPath' must be provided."
            );
        }

        this.logInfo(`Converting SVG to PNG: ${outputPath}`);

        try {
            await this.convert(svgContent, outputPath, width, height);
            this.logInfo(`SVG successfully converted to PNG: ${outputPath}`);
        } catch (error) {
            this.logError("Error converting SVG to PNG:", error);
            throw error;
        }
    }

    /**
     * Converts SVG content to a PNG file, optionally resizing the output.
     * @param svgContent - The SVG content to be converted.
     * @param outputPath - The filesystem path where the PNG should be saved.
     * @param width - Optional width for resizing.
     * @param height - Optional height for resizing.
     */
    private async convert(
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
            const pngBuffer = await sharp(Buffer.from(updatedSvgContent))
                .png()
                .toBuffer();
            await sharp(pngBuffer).toFile(outputPath);
        } catch (error) {
            throw new Error(
                `Error converting SVG to PNG: ${(error as Error).message}`
            );
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Converts SVG content to PNG format with optional resizing.";
    }
}

// ============================================================================
// Export
// ============================================================================

export default SvgToPngAction;
