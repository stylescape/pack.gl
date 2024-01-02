import { __awaiter, __generator } from "tslib";
import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
var FontGenerator = (function () {
    function FontGenerator() {
    }
    FontGenerator.prototype.generateFonts = function (sourceDirectory, outputDiectory) {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
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
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, generateFonts(config)];
                    case 2:
                        _a.sent();
                        console.log('Fonts generated successfully.');
                        return [3, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error generating fonts:', error_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    return FontGenerator;
}());
export default FontGenerator;
//# sourceMappingURL=FontGenerator.js.map