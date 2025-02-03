import { __awaiter } from "tslib";
import { generateFonts, } from "fantasticon";
import fantasticonConfig from "../config/fantasticon.config.js";
class FontGenerator {
    constructor(customConfig = {}) {
        this.config = Object.assign(Object.assign({}, FontGenerator.defaultConfig), customConfig);
    }
    generateFonts(sourceDirectory, outputDiectory, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = Object.assign(Object.assign(Object.assign({}, this.config), { inputDir: sourceDirectory, outputDir: outputDiectory }), options);
            try {
                yield generateFonts(config);
                console.log("Fonts generated successfully.");
            }
            catch (error) {
                console.error("Error generating fonts:", error);
            }
        });
    }
}
FontGenerator.defaultConfig = fantasticonConfig;
export default FontGenerator;
//# sourceMappingURL=FontGenerator.js.map