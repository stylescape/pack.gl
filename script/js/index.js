import { __awaiter, __generator } from "tslib";
import path from 'path';
import { DirectoryCleaner, DirectoryCopier, DirectoryCreator, PackageCreator, VersionWriter, } from 'pack.gl';
import TypeScriptCompiler from "./class/TypeScriptCompiler.js";
import { CONFIG } from './config/config.js';
import packageConfig from "./config/package.config.js";
var directories = Object.values(CONFIG.path);
var tsCompiler = new TypeScriptCompiler();
var packageCreator = new PackageCreator(packageConfig);
var versionWriter = new VersionWriter();
var directoryCopier = new DirectoryCopier();
var directoryCleaner = new DirectoryCleaner();
var directoryCreator = new DirectoryCreator();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, tsFiles, outputDir, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    directoryCleaner.cleanDirectory(CONFIG.path.dist);
                    console.log("Directory cleaned: ".concat(CONFIG.path.dist));
                    console.log('Starting Directory creation...');
                    return [4, directoryCreator.createDirectories('.', directories)];
                case 1:
                    _a.sent();
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
                    return [4, packageCreator.createPackageJson(CONFIG.path.dist)];
                case 7:
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
                    return [3, 9];
                case 8:
                    error_2 = _a.sent();
                    console.error('An error occurred:', error_2);
                    return [3, 9];
                case 9: return [2];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map