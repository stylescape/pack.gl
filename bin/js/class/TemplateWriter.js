import { __awaiter } from "tslib";
import { mkdir, writeFile } from "fs/promises";
import nunjucks from "nunjucks";
import path from "path";
import nunjucksConfig from "../config/nunjucks.config.js";
class TemplateWriter {
    constructor(templatesDir, context = {}, customConfig = {}) {
        this.context = context;
        this.config = Object.assign(Object.assign({}, TemplateWriter.defaultConfig), customConfig);
        nunjucks.configure(templatesDir, this.config);
    }
    generateTemplate(template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return nunjucks.render(template, this.context);
            }
            catch (error) {
                console.error(`Error generating template: ${error}`);
                throw new Error("Template generation failed");
            }
        });
    }
    generateToFile(template, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.generateTemplate(template);
                const dir = path.dirname(outputFile);
                yield mkdir(dir, { recursive: true });
                yield writeFile(outputFile, content, "utf-8");
                console.log(`File written to ${outputFile}`);
            }
            catch (error) {
                console.error(`Error writing to file: ${error}`);
                throw new Error("File writing failed");
            }
        });
    }
}
TemplateWriter.defaultConfig = nunjucksConfig;
export default TemplateWriter;
//# sourceMappingURL=TemplateWriter.js.map