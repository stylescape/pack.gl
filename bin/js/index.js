import { __awaiter, __generator } from "tslib";
import path from 'path';
import { DirectoryCleaner, DirectoryCopier, FileCopier, PackageCreator, VersionWriter, TypeScriptCompiler, JavaScriptMinifier, StylizedLogger, readPackageJson, } from 'pack.gl';
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
        var logger, directoryCleaner, localPackageConfig, packageCreator, packageConfig, fileCopier, directoryCopier, versionWriter, tsCompiler, tsFiles, outputDir, jsMinifier, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    logger = new StylizedLogger();
                    directoryCleaner = new DirectoryCleaner();
                    logger.header('Clean Directories');
                    directoryCleaner.cleanDirectory(CONFIG.path.dist);
                    logger.body("Directory cleaned: ".concat(CONFIG.path.dist));
                    return [4, readPackageJson('./package.json')];
                case 1:
                    localPackageConfig = _a.sent();
                    packageCreator = new PackageCreator(localPackageConfig);
                    packageConfig = packageCreator.config;
                    packageCreator.createPackageJson(CONFIG.path.dist);
                    fileCopier = new FileCopier();
                    fileCopier.copyFileToDirectory(path.join('.', 'README.md'), CONFIG.path.dist);
                    fileCopier.copyFileToDirectory(path.join('.', 'LICENSE'), CONFIG.path.dist);
                    directoryCopier = new DirectoryCopier();
                    return [4, directoryCopier.recursiveCopy(CONFIG.path.ts_input, CONFIG.path.ts_output)];
                case 2:
                    _a.sent();
                    console.log('Files copied successfully.');
                    versionWriter = new VersionWriter();
                    return [4, versionWriter.writeVersionToFile('VERSION', packageConfig.version)];
                case 3:
                    _a.sent();
                    tsCompiler = new TypeScriptCompiler();
                    tsFiles = [
                        path.join(CONFIG.path.ts_input, 'index.ts'),
                    ];
                    outputDir = './dist/js';
                    return [4, tsCompiler.compile(tsFiles, outputDir)];
                case 4:
                    _a.sent();
                    jsMinifier = new JavaScriptMinifier();
                    return [4, jsMinifier.minifyFile(path.join(CONFIG.path.js_output, 'index.js'), path.join(CONFIG.path.js_output, "".concat(packageConfig.name, ".min.js")))
                            .then(function () { return console.log('JavaScript minification completed.'); })
                            .catch(console.error)];
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