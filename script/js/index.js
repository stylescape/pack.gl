import { __awaiter, __generator } from "tslib";
import path from 'path';
import { DirectoryCleaner, DirectoryCopier, DirectoryCreator, PackageCreator, VersionWriter, gl_installer, } from 'pack.gl';
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
                    _a.trys.push([0, 9, , 10]);
                    return [4, gl_installer()];
                case 1:
                    _a.sent();
                    directoryCleaner.cleanDirectory(CONFIG.path.dist);
                    console.log("Directory cleaned: ".concat(CONFIG.path.dist));
                    console.log('Starting Directory creation...');
                    return [4, directoryCreator.createDirectories('.', directories)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4, directoryCopier.recursiveCopy(CONFIG.path.ts_input, CONFIG.path.ts_output)];
                case 4:
                    _a.sent();
                    console.log('Files copied successfully.');
                    return [3, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error while copying files:', error_1);
                    return [3, 6];
                case 6: return [4, versionWriter.writeVersionToFile('VERSION', packageConfig.version)];
                case 7:
                    _a.sent();
                    return [4, packageCreator.createPackageJson(CONFIG.path.dist)];
                case 8:
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
                    return [3, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error('An error occurred:', error_2);
                    return [3, 10];
                case 10: return [2];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map