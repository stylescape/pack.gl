import { __assign } from "tslib";
import ts from "typescript";
import path from "path";
import tsConfig from "../config/ts.config.js";
var TypeScriptCompiler = (function () {
    function TypeScriptCompiler(customConfig) {
        if (customConfig === void 0) { customConfig = {}; }
        this.config = __assign(__assign({}, TypeScriptCompiler.defaultConfig), customConfig);
    }
    TypeScriptCompiler.prototype.loadConfig = function (configFilePath, customConfig) {
        var configFile = ts.readConfigFile(configFilePath, ts.sys.readFile);
        if (configFile.error) {
            var error = ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n");
            throw new Error("Error reading tsconfig.json: ".concat(error));
        }
        var configParseResult = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configFilePath), customConfig);
        if (configParseResult.errors.length > 0) {
            var errors = configParseResult.errors.map(function (diagnostic) {
                return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            }).join("\n");
            throw new Error("Error parsing tsconfig.json: ".concat(errors));
        }
        return configParseResult;
    };
    TypeScriptCompiler.prototype.compile = function (filePaths, outDir) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = __assign({ module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2015, outDir: outDir }, _this.config);
            var host = ts.createCompilerHost(options);
            var program = ts.createProgram(filePaths, options, host);
            var emitResult = program.emit();
            var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            allDiagnostics.forEach(function (diagnostic) {
                if (diagnostic.file) {
                    var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
                    var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                    console.error("".concat(diagnostic.file.fileName, " (").concat(line + 1, ",").concat(character + 1, "): ").concat(message));
                }
                else {
                    console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
                }
            });
            var exitCode = emitResult.emitSkipped ? 1 : 0;
            if (exitCode === 0) {
                console.log("Compilation completed successfully.");
                resolve();
            }
            else {
                console.error("Compilation failed.");
                reject(new Error("TypeScript compilation failed"));
            }
        });
    };
    TypeScriptCompiler.defaultConfig = tsConfig;
    return TypeScriptCompiler;
}());
export default TypeScriptCompiler;
//# sourceMappingURL=TypeScriptCompiler.js.map