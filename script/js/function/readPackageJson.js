import { __awaiter, __generator } from "tslib";
import fs from 'fs/promises';
import path from 'path';
function readPackageJson(packageJsonPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fullPath, fileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fullPath = path.resolve(packageJsonPath);
                    return [4, fs.readFile(fullPath, 'utf-8')];
                case 1:
                    fileContent = _a.sent();
                    return [2, JSON.parse(fileContent)];
            }
        });
    });
}
export default readPackageJson;
//# sourceMappingURL=readPackageJson.js.map