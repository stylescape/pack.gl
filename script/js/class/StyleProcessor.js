import { __awaiter, __generator } from "tslib";
import * as sass from 'sass';
import postcss from 'postcss';
import fs from 'fs';
import postcssConfigExpanded from '../config/postcss.config.expanded.js';
import postcssConfigCompressed from '../config/postcss.config.compressed.js';
var StyleProcessor = (function () {
    function StyleProcessor() {
    }
    StyleProcessor.prototype.processPostCSS = function (css, styleOption) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                config = styleOption === 'expanded' ? postcssConfigExpanded : postcssConfigCompressed;
                return [2, postcss(config.plugins).process(css, { from: undefined, map: { inline: false } })];
            });
        });
    };
    StyleProcessor.prototype.processStyles = function (inputFile, outputFile, styleOption) {
        return __awaiter(this, void 0, void 0, function () {
            var result, processed, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4, sass.compileAsync(inputFile, { style: styleOption })];
                    case 1:
                        result = _a.sent();
                        return [4, this.processPostCSS(result.css, styleOption)];
                    case 2:
                        processed = _a.sent();
                        fs.writeFileSync(outputFile, processed.css);
                        if (processed.map) {
                            fs.writeFileSync("".concat(outputFile, ".map"), processed.map.toString());
                        }
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Error processing styles from ".concat(inputFile, ":"), err_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    return StyleProcessor;
}());
export default StyleProcessor;
//# sourceMappingURL=StyleProcessor.js.map