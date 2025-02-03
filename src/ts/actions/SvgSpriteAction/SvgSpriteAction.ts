// ============================================================================
// Imports
// ============================================================================

import fs from "fs";
import path from "path";
import svgSprite from "svg-sprite";
import svgspriteConfig from "../../../../bin/ts/config/svgsprite.config.js";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Classes
// ============================================================================

/**
 * SvgSpriteAction compiles multiple SVG files into a single sprite sheet,
 * making it more efficient to manage and use SVG assets in web applications.
 */
export class SvgSpriteAction extends Action {
    // Parameters
    // ========================================================================

    private config: svgSprite.Config;

    /**
     * Default configuration for SVG sprite generation.
     */
    private static defaultConfig: svgSprite.Config = svgspriteConfig;

    // Constructor
    // ========================================================================

    /**
     * Constructs an instance with merged default and custom configurations.
     * @param {svgSprite.Config} customConfig - Optional custom configuration
     * for svg-sprite.
     */
    constructor(customConfig: svgSprite.Config = {}) {
        super();
        this.config = { ...SvgSpriteAction.defaultConfig, ...customConfig };
    }

    // Methods
    // ========================================================================

    /**
     * Executes the SVG sprite generation process.
     * @param options - Options including source directory and output directory.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const { sourceDir, outputDir } = options;

        if (!sourceDir || !outputDir) {
            throw new Error(
                "Both 'sourceDir' and 'outputDir' must be specified.",
            );
        }

        this.logInfo(`Generating SVG sprite from: ${sourceDir}`);

        try {
            await this.generateSprite(sourceDir, outputDir);
            this.logInfo(`SVG sprite successfully generated in: ${outputDir}`);
        } catch (error) {
            this.logError("Error generating SVG sprite:", error);
            throw error;
        }
    }

    /**
     * Generates an SVG sprite from all SVG files in the specified directory.
     * @param sourceDir - Directory containing source SVG files.
     * @param outputDir - Directory where the generated sprite will be saved.
     */
    private async generateSprite(
        sourceDir: string,
        outputDir: string,
    ): Promise<void> {
        const files = fs.readdirSync(sourceDir);
        const sprite = new svgSprite(this.config);

        for (const file of files) {
            if (path.extname(file) === ".svg") {
                const svgPath = path.resolve(sourceDir, file);
                const content = fs.readFileSync(svgPath, "utf8");
                sprite.add(svgPath, null, content);
            }
        }

        sprite.compile((error, result) => {
            if (error) {
                throw error;
            }

            for (const mode in result) {
                for (const resource in result[mode]) {
                    const outputPath = path.resolve(
                        outputDir,
                        result[mode][resource].path,
                    );
                    fs.mkdirSync(path.dirname(outputPath), {
                        recursive: true,
                    });
                    fs.writeFileSync(
                        outputPath,
                        result[mode][resource].contents,
                    );
                }
            }
        });
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Generates an SVG sprite from a directory of SVG files.";
    }
}

// ============================================================================
// Export
// ============================================================================

export default SvgSpriteAction;
