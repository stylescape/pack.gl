import { __assign, __awaiter, __generator } from "tslib";
import { minify } from "terser";
import { promises as fs } from "fs";
import terserConfig from "../config/terser.config.js";
var JavaScriptMinifier = (function () {
    function JavaScriptMinifier(customConfig) {
        if (customConfig === void 0) { customConfig = {}; }
        this.config = __assign(__assign({}, JavaScriptMinifier.defaultConfig), customConfig);
    }
    JavaScriptMinifier.prototype.minifyFile = function (inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function () {
            var inputCode, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4, fs.readFile(inputPath, "utf8")];
                    case 1:
                        inputCode = _a.sent();
                        return [4, minify(inputCode, this.config)];
                    case 2:
                        result = _a.sent();
                        if (!result.code) return [3, 4];
                        return [4, fs.writeFile(outputPath, result.code)];
                    case 3:
                        _a.sent();
                        return [3, 5];
                    case 4: throw new Error("Minification resulted in empty output.");
                    case 5: return [3, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("Error minifying JavaScript file ".concat(inputPath, ":"), error_1);
                        throw error_1;
                    case 7: return [2];
                }
            });
        });
    };
    JavaScriptMinifier.defaultConfig = terserConfig;
    return JavaScriptMinifier;
}());
export default JavaScriptMinifier;
//# sourceMappingURL=JavaScriptMinifier.js.map