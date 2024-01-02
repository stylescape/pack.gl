import { __awaiter, __generator } from "tslib";
import path from 'path';
import FontGenerator from './class/FontGenerator.js';
import SvgPackager from "./class/SvgPackager.js";
import StyleProcessor from "./class/StyleProcessor.js";
import SvgSpriteGenerator from "./class/SvgSpriteGenerator.js";
import PackageCreator from './class/PackageCreator.js';
import VersionWriter from './class/VersionWriter.js';
import FileCopier from './class/FileCopier.js';
import FileRenamer from './class/FileRenamer.js';
import DirectoryCreator from './class/DirectoryCreator.js';
import DirectoryCopier from './class/DirectoryCopier.js';
import DirectoryCleaner from './class/DirectoryCleaner.js';
import TypeScriptCompiler from './class/TypeScriptCompiler.js';
import JavaScriptMinifier from './class/JavaScriptMinifier.js';
import { CONFIG } from './config/config.js';
import svgspriteConfig from "./config/svgsprite.config.js";
import packageConfig from "./config/package.config.js";
import tsConfig from "./config/ts.config.js";
import tensorConfig from "./config/terser.config.js";
var directories = Object.values(CONFIG.path);
var spriteGenerator = new SvgSpriteGenerator(svgspriteConfig);
var tsCompiler = new TypeScriptCompiler(tsConfig);
var jsMinifier = new JavaScriptMinifier(tensorConfig);
var packageCreator = new PackageCreator(packageConfig);
var svgPackager = new SvgPackager();
var fontGenerator = new FontGenerator();
var styleProcessor = new StyleProcessor();
var versionWriter = new VersionWriter();
var fileCopier = new FileCopier();
var fileRenamer = new FileRenamer();
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