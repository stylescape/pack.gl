import { __awaiter, __generator } from "tslib";
import { ESLint } from "eslint";
var CodeLinter = (function () {
    function CodeLinter(projectRoot) {
        this.projectRoot = projectRoot;
        this.eslint = new ESLint({ cwd: projectRoot });
    }
    CodeLinter.prototype.lintFiles = function (targetFiles) {
        return __awaiter(this, void 0, void 0, function () {
            var results, formatter, resultText, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4, this.eslint.lintFiles(targetFiles)];
                    case 1:
                        results = _a.sent();
                        return [4, ESLint.outputFixes(results)];
                    case 2:
                        _a.sent();
                        return [4, this.eslint.loadFormatter("stylish")];
                    case 3:
                        formatter = _a.sent();
                        resultText = formatter.format(results);
                        console.log(resultText);
                        return [2, results];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error occurred while linting:", error_1);
                        throw error_1;
                    case 5: return [2];
                }
            });
        });
    };
    return CodeLinter;
}());
export default CodeLinter;
//# sourceMappingURL=CodeLinter.js.map