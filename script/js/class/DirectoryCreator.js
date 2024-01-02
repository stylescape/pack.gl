import { __awaiter, __generator } from "tslib";
import fs from 'fs';
import path from 'path';
var DirectoryCreator = (function () {
    function DirectoryCreator() {
    }
    DirectoryCreator.prototype.createDirectories = function (basePath, directories) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                directories.forEach(function (dir) {
                    var dirPath = path.join(basePath, dir);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                        console.log("Directory created: ".concat(dirPath));
                    }
                    else {
                        console.log("Directory already exists: ".concat(dirPath));
                    }
                });
                return [2];
            });
        });
    };
    return DirectoryCreator;
}());
export default DirectoryCreator;
//# sourceMappingURL=DirectoryCreator.js.map