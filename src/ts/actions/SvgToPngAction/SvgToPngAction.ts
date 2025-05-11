// ============================================================================
// Imports
// ============================================================================

import { createCanvas } from "canvas";
import { Canvg } from "canvg";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Utilities
// ============================================================================

function getSafeRenderingContext(canvas: ReturnType<typeof createCanvas>) {
    return canvas.getContext("2d");
}

// ============================================================================
// Classes
// ============================================================================

/**
 * SvgToPngAction converts SVG content to PNG format.
 * Uses `canvg` for conversion and `jsdom` for SVG element manipulation.
 */
export class SvgToPngAction extends Action {
    /**
     * Executes the SVG-to-PNG conversion process.
     * @param options - Options including SVG content, output path, width,
     * and height.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { svgContent, outputPath, width, height } = options;

        if (!svgContent || !outputPath) {
            throw new Error(
                "Both 'svgContent' and 'outputPath' must be provided.",
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
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

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

            const updatedSvgContent = svgElement.outerHTML;

            const canvas = createCanvas(w, h);
            const ctx = getSafeRenderingContext(canvas) as unknown as any;

            const canvg = await Canvg.from(ctx, updatedSvgContent);
            await canvg.render();

            const pngBuffer = canvas.toBuffer("image/png");
            fs.writeFileSync(outputPath, pngBuffer);
        } catch (error) {
            throw new Error(
                `Error converting SVG to PNG: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Converts SVG content to PNG format with optional resizing using canvg and canvas.";
    }
}

// ============================================================================
// Export
// ============================================================================

export default SvgToPngAction;
