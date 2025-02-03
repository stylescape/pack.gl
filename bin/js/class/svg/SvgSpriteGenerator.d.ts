import svgSprite from "svg-sprite";
declare class SvgSpriteGenerator {
    private config;
    private static defaultConfig;
    constructor(customConfig?: svgSprite.Config);
    generateSprite(sourceDir: string, outputDir: string): Promise<void>;
}
export default SvgSpriteGenerator;
