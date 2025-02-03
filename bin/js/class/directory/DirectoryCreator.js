import { __awaiter } from "tslib";
import { promises as fsPromises } from "fs";
import path from "path";
class DirectoryCreator {
    createDirectories(basePath, directories) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const dir of directories) {
                    const dirPath = path.join(basePath, dir);
                    yield fsPromises.mkdir(dirPath, { recursive: true });
                }
            }
            catch (error) {
                console.error(`Error creating directories: ${error}`);
                throw error;
            }
        });
    }
}
export default DirectoryCreator;
//# sourceMappingURL=DirectoryCreator.js.map