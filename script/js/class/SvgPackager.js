import { __assign, __awaiter, __generator } from "tslib";
import * as fs_extra from 'fs-extra';
import { promises as fs } from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { fileURLToPath } from "url";
import SVGO from 'svgo';
import { loadConfig } from 'svgo';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var SvgPackager = (function () {
    function SvgPackager() {
    }
    SvgPackager.prototype.processSvgFiles = function (directory, outputDirectory, ts_output_directory, json_output_directory) {
        return __awaiter(this, void 0, void 0, function () {
            var iconNames, svgFiles, _i, svgFiles_1, file, iconName, svgContent, optimizedSvg, resultSvg, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iconNames = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        console.log("Processing directory: ".concat(directory));
                        svgFiles = glob.sync("".concat(directory, "/**/*.svg"));
                        _i = 0, svgFiles_1 = svgFiles;
                        _a.label = 2;
                    case 2:
                        if (!(_i < svgFiles_1.length)) return [3, 8];
                        file = svgFiles_1[_i];
                        console.log("Processing file: ".concat(file));
                        iconName = this.sanitizeFileName(path.basename(file, '.svg'));
                        iconNames.push(iconName);
                        console.log("Processing icon: ".concat(iconName));
                        return [4, this.readSvgFile(file)];
                    case 3:
                        svgContent = _a.sent();
                        return [4, this.optimizeSvg(file, svgContent)];
                    case 4:
                        optimizedSvg = _a.sent();
                        resultSvg = optimizedSvg.trim();
                        return [4, this.writeSvgFile(file, iconName, resultSvg, outputDirectory)];
                    case 5:
                        _a.sent();
                        return [4, this.writeTypeScriptFile(file, iconName, resultSvg, ts_output_directory)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3, 2];
                    case 8: return [4, this.writeIconsJson(iconNames, json_output_directory)];
                    case 9:
                        _a.sent();
                        console.log("Successfully processed ".concat(svgFiles.length, " SVG files."));
                        return [3, 11];
                    case 10:
                        error_1 = _a.sent();
                        console.error('Error processing SVG files:', error_1);
                        throw error_1;
                    case 11: return [2];
                }
            });
        });
    };
    SvgPackager.prototype.readSvgFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var absolutePath, svgContent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        absolutePath = path.resolve(filePath);
                        return [4, fs.readFile(absolutePath, 'utf8')];
                    case 1:
                        svgContent = _a.sent();
                        return [2, svgContent];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error reading file:', filePath, error_2);
                        throw error_2;
                    case 3: return [2];
                }
            });
        });
    };
    SvgPackager.prototype.sanitizeFileName = function (fileName) {
        return fileName.replace(/[^a-zA-Z0-9_]/g, '_');
    };
    SvgPackager.prototype.optimizeSvg = function (filePath, svgContent) {
        return __awaiter(this, void 0, void 0, function () {
            var config, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4, loadConfig(path.join(__dirname, '../config/svgo.config.js'))];
                    case 1:
                        config = _a.sent();
                        return [4, SVGO.optimize(svgContent, __assign({ path: filePath }, config))];
                    case 2:
                        result = _a.sent();
                        return [2, result.data];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error optimizing SVG:', error_3);
                        throw error_3;
                    case 4: return [2];
                }
            });
        });
    };
    SvgPackager.prototype.writeTypeScriptFile = function (filePath, iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var tsContent, outputPath, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tsContent = "export const icon_".concat(iconName, " = `").concat(svgContent, "`;\n");
                        outputPath = path.join(outputDirectory, "".concat(iconName, ".ts"));
                        return [4, fs_extra.outputFile(outputPath, tsContent)];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error creating TypeScript file for ".concat(filePath, ":"), error_4);
                        throw error_4;
                    case 3: return [2];
                }
            });
        });
    };
    SvgPackager.prototype.writeSvgFile = function (filePath, iconName, svgContent, outputDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var outputPath, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        outputPath = path.join(outputDirectory, "".concat(iconName, ".svg"));
                        return [4, fs_extra.outputFile(outputPath, svgContent)];
                    case 1:
                        _a.sent();
                        console.log("SVG file written successfully for ".concat(iconName));
                        return [3, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error writing SVG file for ".concat(iconName, ":"), error_5);
                        throw error_5;
                    case 3: return [2];
                }
            });
        });
    };
    SvgPackager.prototype.writeIconsJson = function (iconNames, outputDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonContent, outputPath, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        jsonContent = JSON.stringify(iconNames, null, 2);
                        outputPath = path.join(outputDirectory, 'icons.json');
                        return [4, fs_extra.outputFile(outputPath, jsonContent)];
                    case 1:
                        _a.sent();
                        console.log('Icons JSON file created successfully');
                        return [3, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error writing icons JSON file:', error_6);
                        throw error_6;
                    case 3: return [2];
                }
            });
        });
    };
    return SvgPackager;
}());
export default SvgPackager;
//# sourceMappingURL=SvgPackager.js.map