import { __awaiter } from "tslib";
import { promises as fs } from "fs";
import path from "path";
import postcss from "postcss";
import * as sass from "sass";
import { NodePackageImporter } from "sass";
import postcssConfigCompressed from "../../config/postcss.config.compressed.js";
import postcssConfigExpanded from "../../config/postcss.config.expanded.js";
class StyleProcessor {
    processPostCSS(css, styleOption) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = styleOption === "expanded"
                ? postcssConfigExpanded
                : postcssConfigCompressed;
            const result = yield postcss(config.plugins).process(css, {
                from: undefined,
                map: { inline: false },
            });
            return result.css;
        });
    }
    ensureDirectoryExists(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.mkdir(dirPath, { recursive: true });
            }
            catch (error) {
                if (error instanceof Error) {
                    const nodeError = error;
                    if (nodeError.code !== "EEXIST") {
                        throw nodeError;
                    }
                }
                else {
                    throw error;
                }
            }
        });
    }
    processStyles(inputFile, outputFile, styleOption) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const outputDir = path.dirname(outputFile);
                yield this.ensureDirectoryExists(outputDir);
                const result = yield sass.compileAsync(inputFile, {
                    style: styleOption,
                    importers: [new NodePackageImporter()],
                });
                const processedCss = yield this.processPostCSS(result.css, styleOption);
                yield fs.writeFile(outputFile, processedCss, "utf-8");
            }
            catch (err) {
                console.error(`Error processing styles from ${inputFile}:`, err);
                throw err;
            }
        });
    }
}
export default StyleProcessor;
//# sourceMappingURL=StyleProcessor.js.map