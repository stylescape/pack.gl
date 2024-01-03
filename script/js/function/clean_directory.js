import { __awaiter, __generator } from "tslib";
import DirectoryCleaner from '../class/DirectoryCleaner.js';
import StylizedLogger from '../class/StylizedLogger.js';
var directoryCleaner = new DirectoryCleaner();
var logger = new StylizedLogger();
function cleanDirectory(directoryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    logger.header('Clean Directories');
                    return [4, directoryCleaner.cleanDirectory(directoryPath)];
                case 1:
                    _a.sent();
                    logger.body("Directory cleaned: ".concat(directoryPath));
                    return [3, 3];
                case 2:
                    error_1 = _a.sent();
                    logger.error("Error cleaning directory: ".concat(error_1));
                    throw error_1;
                case 3: return [2];
            }
        });
    });
}
export default cleanDirectory;
//# sourceMappingURL=clean_directory.js.map