import { __awaiter, __generator } from "tslib";
import fs from 'fs';
var FileRenamer = (function () {
    function FileRenamer() {
    }
    FileRenamer.prototype.renameFile = function (srcPath, targetPath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, fs.promises.rename(srcPath, targetPath)];
                    case 1:
                        _a.sent();
                        console.log("File renamed from ".concat(srcPath, " to ").concat(targetPath));
                        return [3, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error renaming file:', error_1);
                        throw error_1;
                    case 3: return [2];
                }
            });
        });
    };
    return FileRenamer;
}());
export default FileRenamer;
//# sourceMappingURL=FileRenamer.js.map