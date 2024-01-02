import { __awaiter } from "tslib";
import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
class FontGenerator {
    generateFonts(sourceDirectory, outputDiectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = {
                inputDir: sourceDirectory,
                outputDir: outputDiectory,
                name: 'unit.gl',
                fontTypes: [
                    FontAssetType.TTF,
                    FontAssetType.WOFF,
                    FontAssetType.WOFF2,
                    FontAssetType.EOT,
                    FontAssetType.SVG,
                ],
                assetTypes: [
                    OtherAssetType.CSS,
                    OtherAssetType.SCSS,
                    OtherAssetType.SASS,
                    OtherAssetType.HTML,
                    OtherAssetType.JSON,
                    OtherAssetType.TS,
                ],
                formatOptions: {
                    json: { indent: 4 },
                },
                pathOptions: {
                    json: './dist/font/unit.gl.json',
                    css: './dist/font/unit.gl.css',
                    scss: './dist/font/unit.gl.scss',
                    woff: './dist/font/unit.gl.woff',
                    woff2: './dist/font/unit.gl.woff2',
                },
                selector: '.igl',
                prefix: 'igl',
                fontsUrl: './fonts',
            };
            try {
                yield generateFonts(config);
                console.log('Fonts generated successfully.');
            }
            catch (error) {
                console.error('Error generating fonts:', error);
            }
        });
    }
}
export default FontGenerator;
//# sourceMappingURL=FontGenerator.js.map