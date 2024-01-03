import { __awaiter, __generator } from "tslib";
import path from 'path';
import { DirectoryCleaner, DirectoryCopier, PackageCreator, VersionWriter, TypeScriptCompiler, StylizedLogger, gl_installer, readPackageJson, } from 'pack.gl';
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
        var logger, directoryCleaner, localPackageConfig, packageCreator, packageConfig, directoryCopier, versionWriter, tsCompiler, tsFiles, outputDir, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    logger = new StylizedLogger();
                    logger.header('Install .gl libraries');
                    return [4, gl_installer()];
                case 1:
                    _a.sent();
                    directoryCleaner = new DirectoryCleaner();
                    logger.header('Clean Directories');
                    directoryCleaner.cleanDirectory(CONFIG.path.dist);
                    logger.body("Directory cleaned: ".concat(CONFIG.path.dist));
                    return [4, readPackageJson('./package.json')];
                case 2:
                    localPackageConfig = _a.sent();
                    packageCreator = new PackageCreator(localPackageConfig);
                    packageConfig = packageCreator.config;
                    packageCreator.createPackageJson(CONFIG.path.dist);
                    directoryCopier = new DirectoryCopier();
                    return [4, directoryCopier.recursiveCopy(CONFIG.path.ts_input, CONFIG.path.ts_output)];
                case 3:
                    _a.sent();
                    console.log('Files copied successfully.');
                    versionWriter = new VersionWriter();
                    return [4, versionWriter.writeVersionToFile('VERSION', packageConfig.version)];
                case 4:
                    _a.sent();
                    tsCompiler = new TypeScriptCompiler();
                    tsFiles = [
                        path.join(CONFIG.path.ts_input, 'index.ts'),
                    ];
                    outputDir = './dist/js';
                    return [4, tsCompiler.compile(tsFiles, outputDir)];
                case 5:
                    _a.sent();
                    return [3, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map