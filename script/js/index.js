import { __awaiter, __generator } from "tslib";
import path from 'path';
import { DirectoryCleaner, DirectoryCopier, DirectoryCreator, VersionWriter, TypeScriptCompiler, } from 'pack.gl';
import PackageCreator from "./class/PackageCreator.js";
import readPackageJson from "./function/readPackageJson.js";
var tsCompiler = new TypeScriptCompiler();
var versionWriter = new VersionWriter();
var directoryCopier = new DirectoryCopier();
var directoryCleaner = new DirectoryCleaner();
var directoryCreator = new DirectoryCreator();
var CONFIG = {
    path: {
        src: './src',
        dist: './dist',
        json_output: './dist',
        ts_input: './src/ts',
        ts_output: './dist/ts',
        js_output: './dist/js',
    },
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var localPackageConfig, packageCreator, packageConfig, error_1, tsFiles, outputDir, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    directoryCleaner.cleanDirectory(CONFIG.path.dist);
                    console.log("Directory cleaned: ".concat(CONFIG.path.dist));
                    return [4, readPackageJson('./package.json')];
                case 1:
                    localPackageConfig = _a.sent();
                    packageCreator = new PackageCreator(localPackageConfig);
                    packageConfig = packageCreator.config;
                    packageCreator.createPackageJson(CONFIG.path.dist);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, directoryCopier.recursiveCopy(CONFIG.path.ts_input, CONFIG.path.ts_output)];
                case 3:
                    _a.sent();
                    console.log('Files copied successfully.');
                    return [3, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error while copying files:', error_1);
                    return [3, 5];
                case 5: return [4, versionWriter.writeVersionToFile('VERSION', packageConfig.version)];
                case 6:
                    _a.sent();
                    try {
                        tsFiles = [
                            path.join(CONFIG.path.ts_input, 'index.ts'),
                        ];
                        outputDir = './dist/js';
                        console.log('Starting TypeScript compilation...');
                        tsCompiler.compile(tsFiles, outputDir);
                        console.log('TypeScript compilation completed.');
                    }
                    catch (error) {
                        console.error('An error occurred:', error);
                    }
                    return [3, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error('An error occurred:', error_2);
                    return [3, 8];
                case 8: return [2];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map