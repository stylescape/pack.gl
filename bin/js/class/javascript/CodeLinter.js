import { __awaiter } from "tslib";
import { ESLint } from "eslint";
class CodeLinter {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.eslint = new ESLint({ cwd: projectRoot });
    }
    lintFiles(targetFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.eslint.lintFiles(targetFiles);
                yield ESLint.outputFixes(results);
                const formatter = yield this.eslint.loadFormatter("stylish");
                const resultText = formatter.format(results);
                console.log(resultText);
                return results;
            }
            catch (error) {
                console.error("Error occurred while linting:", error);
                throw error;
            }
        });
    }
}
export default CodeLinter;
//# sourceMappingURL=CodeLinter.js.map