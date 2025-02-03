import { __awaiter } from "tslib";
import fs from "fs/promises";
import path from "path";
class DirectoryScanner {
    scanDirectory(dirPath_1) {
        return __awaiter(this, arguments, void 0, function* (dirPath, recursive = false) {
            try {
                const entries = yield fs.readdir(dirPath, { withFileTypes: true });
                const files = yield Promise.all(entries.map((entry) => __awaiter(this, void 0, void 0, function* () {
                    const resolvedPath = path.resolve(dirPath, entry.name);
                    return entry.isDirectory() && recursive
                        ? this.scanDirectory(resolvedPath, true)
                        : resolvedPath;
                })));
                return files.flat();
            }
            catch (error) {
                console.error(`Error scanning directory: ${dirPath}`, error);
                throw error;
            }
        });
    }
}
export default DirectoryScanner;
//# sourceMappingURL=DirectoryScanner.js.map