import { __awaiter } from "tslib";
import { execFile } from "child_process";
import util from "util";
const execFileAsync = util.promisify(execFile);
class DocumentationGenerator {
    constructor(sourcePath, outputPath, generatorCommand) {
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
        this.generatorCommand = generatorCommand;
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const args = ["-c", this.sourcePath, "-o", this.outputPath];
                const { stdout, stderr } = yield execFileAsync(this.generatorCommand, args);
                if (stderr) {
                    throw new Error(`Documentation generation failed: ${stderr}`);
                }
                console.log(stdout);
                console.log("Documentation generated successfully.");
            }
            catch (error) {
                console.error("Error occurred while generating documentation:", error);
                throw error;
            }
        });
    }
}
export default DocumentationGenerator;
//# sourceMappingURL=DocumentationGenerator.js.map