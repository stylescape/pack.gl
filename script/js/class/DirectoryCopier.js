import { __awaiter } from "tslib";
import path from 'path';
import { promises as fsPromises } from 'fs';
class DirectoryCopier {
    copyFiles(srcDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resolvedSrcDir = path.resolve(srcDir);
                const resolvedDestDir = path.resolve(destDir);
                yield this.recursiveCopy(resolvedSrcDir, resolvedDestDir);
                console.log(`Files copied from ${resolvedSrcDir} to ${resolvedDestDir}`);
            }
            catch (error) {
                console.error('Error copying files:', error);
                throw error;
            }
        });
    }
    recursiveCopy(srcDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fsPromises.mkdir(destDir, { recursive: true });
            const entries = yield fsPromises.readdir(srcDir, { withFileTypes: true });
            for (let entry of entries) {
                const srcPath = path.join(srcDir, entry.name);
                const destPath = path.join(destDir, entry.name);
                entry.isDirectory() ?
                    yield this.recursiveCopy(srcPath, destPath) :
                    yield fsPromises.copyFile(srcPath, destPath);
            }
        });
    }
}
export default DirectoryCopier;
//# sourceMappingURL=DirectoryCopier.js.map