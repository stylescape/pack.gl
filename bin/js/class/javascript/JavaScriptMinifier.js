import { __awaiter } from "tslib";
import { promises as fs } from "fs";
import { minify } from "terser";
import terserConfig from "../../config/terser.config.js";
class JavaScriptMinifier {
    constructor(customConfig = {}) {
        this.config = Object.assign(Object.assign({}, JavaScriptMinifier.defaultConfig), customConfig);
    }
    minifyFile(inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const inputCode = yield fs.readFile(inputPath, "utf8");
                const result = yield minify(inputCode, this.config);
                if (result.code) {
                    yield fs.writeFile(outputPath, result.code);
                }
                else {
                    throw new Error("Minification resulted in empty output.");
                }
            }
            catch (error) {
                console.error(`Error minifying JavaScript file ${inputPath}:`, error);
                throw error;
            }
        });
    }
}
JavaScriptMinifier.defaultConfig = terserConfig;
export default JavaScriptMinifier;
//# sourceMappingURL=JavaScriptMinifier.js.map