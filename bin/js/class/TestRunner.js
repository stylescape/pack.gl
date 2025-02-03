import { __awaiter } from "tslib";
import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);
class TestRunner {
    constructor(testCommand) {
        this.testCommand = testCommand;
    }
    runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { stdout, stderr } = yield execAsync(this.testCommand);
                if (stderr) {
                    throw new Error(stderr);
                }
                return stdout;
            }
            catch (error) {
                console.error("Error occurred while running tests:", error);
                throw error;
            }
        });
    }
}
export default TestRunner;
//# sourceMappingURL=TestRunner.js.map