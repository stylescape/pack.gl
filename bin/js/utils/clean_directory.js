import { __awaiter } from "tslib";
import DirectoryCleaner from "../class/directory/DirectoryCleaner.js";
import StylizedLogger from "../class/StylizedLogger.js";
const directoryCleaner = new DirectoryCleaner();
const logger = new StylizedLogger();
function cleanDirectory(directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger.header("Clean Directories");
            yield directoryCleaner.cleanDirectory(directoryPath);
            logger.body(`Directory cleaned: ${directoryPath}`);
        }
        catch (error) {
            logger.error(`Error cleaning directory: ${error}`);
            throw error;
        }
    });
}
export default cleanDirectory;
//# sourceMappingURL=clean_directory.js.map