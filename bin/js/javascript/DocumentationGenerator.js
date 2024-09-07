import { __awaiter, __generator } from "tslib";
import { exec } from "child_process";
import util from "util";
var execAsync = util.promisify(exec);
var DocumentationGenerator = (function () {
    function DocumentationGenerator(sourcePath, outputPath, generatorCommand) {
        this.sourcePath = sourcePath;
        this.outputPath = outputPath;
        this.generatorCommand = generatorCommand;
    }
    DocumentationGenerator.prototype.generate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, stdout, stderr, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4, execAsync("".concat(this.generatorCommand, " -c ").concat(this.sourcePath, " -o ").concat(this.outputPath))];
                    case 1:
                        _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        if (stderr) {
                            throw new Error("Documentation generation failed: ".concat(stderr));
                        }
                        console.log(stdout);
                        console.log("Documentation generated successfully.");
                        return [3, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Error occurred while generating documentation:", error_1);
                        throw error_1;
                    case 3: return [2];
                }
            });
        });
    };
    return DocumentationGenerator;
}());
export default DocumentationGenerator;
//# sourceMappingURL=DocumentationGenerator.js.map