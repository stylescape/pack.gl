import { __awaiter, __generator } from "tslib";
import path from 'path';
import { promises as fsPromises } from 'fs';
var DirectoryCopier = (function () {
    function DirectoryCopier() {
    }
    DirectoryCopier.prototype.copyFiles = function (srcDir, destDir) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedSrcDir, resolvedDestDir, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        resolvedSrcDir = path.resolve(srcDir);
                        resolvedDestDir = path.resolve(destDir);
                        return [4, this.recursiveCopy(resolvedSrcDir, resolvedDestDir)];
                    case 1:
                        _a.sent();
                        console.log("Files copied from ".concat(resolvedSrcDir, " to ").concat(resolvedDestDir));
                        return [3, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error copying files:', error_1);
                        throw error_1;
                    case 3: return [2];
                }
            });
        });
    };
    DirectoryCopier.prototype.recursiveCopy = function (srcDir, destDir) {
        return __awaiter(this, void 0, void 0, function () {
            var entries, _i, entries_1, entry, srcPath, destPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, fsPromises.mkdir(destDir, { recursive: true })];
                    case 1:
                        _b.sent();
                        return [4, fsPromises.readdir(srcDir, { withFileTypes: true })];
                    case 2:
                        entries = _b.sent();
                        _i = 0, entries_1 = entries;
                        _b.label = 3;
                    case 3:
                        if (!(_i < entries_1.length)) return [3, 9];
                        entry = entries_1[_i];
                        srcPath = path.join(srcDir, entry.name);
                        destPath = path.join(destDir, entry.name);
                        if (!entry.isDirectory()) return [3, 5];
                        return [4, this.recursiveCopy(srcPath, destPath)];
                    case 4:
                        _a = _b.sent();
                        return [3, 7];
                    case 5: return [4, fsPromises.copyFile(srcPath, destPath)];
                    case 6:
                        _a = _b.sent();
                        _b.label = 7;
                    case 7:
                        _a;
                        _b.label = 8;
                    case 8:
                        _i++;
                        return [3, 3];
                    case 9: return [2];
                }
            });
        });
    };
    return DirectoryCopier;
}());
export default DirectoryCopier;
//# sourceMappingURL=DirectoryCopier.js.map