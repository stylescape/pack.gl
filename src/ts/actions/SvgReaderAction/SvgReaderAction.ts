// ============================================================================
// Imports
// ============================================================================

import { promises as fs } from "fs";
import path from "path";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Classes
// ============================================================================

/**
 * SvgReaderAction is responsible for reading SVG file contents and
 * making them available for further processing in the pipeline.
 */
export class SvgReaderAction extends Action {


    // Methods
    // ========================================================================

    /**
     * Executes the SVG reading action.
     * @param options - The options specifying the SVG file path.
     * @returns A Promise that resolves with the content of the SVG file.
     */
    async execute(options: ActionOptionsType): Promise<string> {
        const { filePath } = options;

        if (!filePath) {
            throw new Error("Missing required option: 'filePath'.");
        }

        this.logInfo(`Reading SVG file: ${filePath}`);

        try {
            const content = await this.readSvg(filePath);
            this.logInfo(`Successfully read SVG file: ${filePath}`);
            return content;
        } catch (error) {
            this.logError(`Error reading SVG file: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Reads the content of an SVG file asynchronously.
     * @param filePath The path to the SVG file.
     * @returns A promise that resolves to the SVG file content.
     */
    private async readSvg(filePath: string): Promise<string> {
        return fs.readFile(path.resolve(filePath), "utf-8");
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Reads an SVG file and returns its content for further processing.";
    }
}

// ============================================================================
// Export
// ============================================================================

export default SvgReaderAction;
