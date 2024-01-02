import { __awaiter, __generator } from "tslib";
import fs from 'fs';
import path from 'path';
var PackageCreator = (function () {
    function PackageCreator(packageJson) {
        this.packageJson = packageJson;
    }
    PackageCreator.prototype.createPackageJson = function (outputDir) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, data;
            return __generator(this, function (_a) {
                filePath = path.join(outputDir, 'package.json');
                data = JSON.stringify(this.packageJson, null, 2);
                fs.writeFileSync(filePath, data, 'utf-8');
                console.log("package.json created at ".concat(filePath));
                return [2];
            });
        });
    };
    return PackageCreator;
}());
export default PackageCreator;
//# sourceMappingURL=PackageCreator.js.map