import { __awaiter, __generator } from "tslib";
import fs from 'fs';
import path from 'path';
var FileCopier = (function () {
    function FileCopier() {
    }
    FileCopier.prototype.copyFileToDirectory = function (srcFile, destDir) {
        return __awaiter(this, void 0, void 0, function () {
            var fileName, destFilePath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fileName = path.basename(srcFile);
                        destFilePath = path.join(destDir, fileName);
                        return [4, fs.promises.copyFile(srcFile, destFilePath)];
                    case 1:
                        _a.sent();
                        console.log("File copied from ".concat(srcFile, " to ").concat(destFilePath));
                        return [3, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error copying file:', error_1);
                        throw error_1;
                    case 3: return [2];
                }
            });
        });
    };
    return FileCopier;
}());
export default FileCopier;
//# sourceMappingURL=FileCopier.js.map