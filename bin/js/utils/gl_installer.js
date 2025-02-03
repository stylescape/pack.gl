import { __awaiter } from "tslib";
import NpmCommandRunner from "../class/NpmCommandRunner.js";
import StylizedLogger from "../class/StylizedLogger.js";
const runner = new NpmCommandRunner();
const logger = new StylizedLogger();
function gl_installer() {
    return __awaiter(this, void 0, void 0, function* () {
        const packages = [
            "pack.gl",
            "unit.gl",
            "hue.gl",
            "page.gl",
            "grid.gl",
            "block.gl",
            "deep.gl",
            "icon.gl",
            "loop.gl",
        ];
        try {
            logger.header("Install .gl libraries");
            for (const pkg of packages) {
                logger.body(`Running npm install for ${pkg}...`);
                const output = yield runner.runCommand(`install ${pkg}@latest --save-dev`);
                logger.body(output);
            }
        }
        catch (error) {
            console.error("An error occurred:", error);
        }
    });
}
export default gl_installer;
//# sourceMappingURL=gl_installer.js.map