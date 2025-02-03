import path from "path";
import ts from "typescript";
import tsConfig from "../../config/ts.config.js";
class TypeScriptCompiler {
    constructor(customConfig = {}) {
        this.config = Object.assign(Object.assign({}, TypeScriptCompiler.defaultConfig), customConfig);
    }
    loadConfig(configFilePath, customConfig) {
        const configFile = ts.readConfigFile(configFilePath, ts.sys.readFile);
        if (configFile.error) {
            const error = ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n");
            throw new Error(`Error reading tsconfig.json: ${error}`);
        }
        const configParseResult = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configFilePath), customConfig);
        if (configParseResult.errors.length > 0) {
            const errors = configParseResult.errors
                .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
                .join("\n");
            throw new Error(`Error parsing tsconfig.json: ${errors}`);
        }
        return configParseResult;
    }
    compile(filePaths, outDir) {
        return new Promise((resolve, reject) => {
            const options = Object.assign({ module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2015, outDir }, this.config);
            const host = ts.createCompilerHost(options);
            const program = ts.createProgram(filePaths, options, host);
            const emitResult = program.emit();
            const allDiagnostics = ts
                .getPreEmitDiagnostics(program)
                .concat(emitResult.diagnostics);
            allDiagnostics.forEach((diagnostic) => {
                if (diagnostic.file) {
                    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                    console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
                }
                else {
                    console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
                }
            });
            const exitCode = emitResult.emitSkipped ? 1 : 0;
            if (exitCode === 0) {
                console.log("Compilation completed successfully.");
                resolve();
            }
            else {
                console.error("Compilation failed.");
                reject(new Error("TypeScript compilation failed"));
            }
        });
    }
}
TypeScriptCompiler.defaultConfig = tsConfig;
export default TypeScriptCompiler;
//# sourceMappingURL=TypeScriptCompiler.js.map