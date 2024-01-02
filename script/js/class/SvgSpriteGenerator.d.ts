declare class SvgSpriteGenerator {
    private config;
    constructor(config: any);
    generateSprite(sourceDir: string, outputDir: string): Promise<void>;
}
export default SvgSpriteGenerator;
