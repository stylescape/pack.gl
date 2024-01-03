import { __awaiter, __generator } from "tslib";
import NpmCommandRunner from '../class/NpmCommandRunner.js';
import StylizedLogger from '../class/StylizedLogger.js';
var runner = new NpmCommandRunner();
var logger = new StylizedLogger();
function gl_installer() {
    return __awaiter(this, void 0, void 0, function () {
        var packages, _i, packages_1, pkg, output, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    packages = [
                        'pack.gl',
                        'unit.gl',
                        'hue.gl',
                        'page.gl',
                        'grid.gl',
                        'block.gl',
                        'deep.gl',
                        'icon.gl',
                        'loop.gl',
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    logger.header('Install .gl libraries');
                    _i = 0, packages_1 = packages;
                    _a.label = 2;
                case 2:
                    if (!(_i < packages_1.length)) return [3, 5];
                    pkg = packages_1[_i];
                    logger.body("Running npm install for ".concat(pkg, "..."));
                    return [4, runner.runCommand("install ".concat(pkg, "@latest --save-dev"))];
                case 3:
                    output = _a.sent();
                    logger.body(output);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3, 2];
                case 5: return [3, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
export default gl_installer;
//# sourceMappingURL=gl_installer.js.map