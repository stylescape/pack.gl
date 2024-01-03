import { __assign, __awaiter, __generator } from "tslib";
import fs from 'fs/promises';
import path from 'path';
import packageConfig from "../config/package.config.js";
var PackageCreator = (function () {
    function PackageCreator(customConfig) {
        if (customConfig === void 0) { customConfig = {}; }
        var newConfig = {
            name: customConfig.name,
            version: customConfig.version,
            description: customConfig.description,
            keywords: customConfig.keywords,
            license: customConfig.license,
            homepage: customConfig.homepage,
            dependencies: customConfig.dependencies,
        };
        this.config = __assign(__assign({}, PackageCreator.defaultConfig), newConfig);
    }
    PackageCreator.prototype.createPackageJson = function (outputDir) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = path.join(outputDir, 'package.json');
                        data = JSON.stringify(this.config, null, 2);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4, this.ensureDirectoryExists(outputDir)];
                    case 2:
                        _a.sent();
                        return [4, fs.writeFile(filePath, data, 'utf-8')];
                    case 3:
                        _a.sent();
                        console.log("package.json created at ".concat(filePath));
                        return [3, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error creating package.json: ".concat(error_1));
                        throw error_1;
                    case 5: return [2];
                }
            });
        });
    };
    PackageCreator.prototype.ensureDirectoryExists = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, fs.mkdir(dirPath, { recursive: true })];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2 instanceof Error && error_2.code !== 'EEXIST') {
                            throw error_2;
                        }
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    PackageCreator.defaultConfig = packageConfig;
    return PackageCreator;
}());
export default PackageCreator;
//# sourceMappingURL=PackageCreator.js.map