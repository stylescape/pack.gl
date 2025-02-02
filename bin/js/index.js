import { __awaiter } from "tslib";
import { DirectoryCleaner, DirectoryCopier, FileCopier, PackageCreator, StylizedLogger, VersionWriter, readPackageJson, } from "pack.gl";
import path from "path";
import TypeScriptCompiler from "./javascript/TypeScriptCompiler.js";
const CONFIG = {
    path: {
        src: "./src",
        dist: "./dist",
        json_output: "./dist",
        ts_input: "./src/ts",
        ts_output: "./dist/ts",
        js_output: "./dist/js",
    },
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const logger = new StylizedLogger();
            const directoryCleaner = new DirectoryCleaner();
            logger.header("Clean Directories");
            directoryCleaner.cleanDirectory(CONFIG.path.dist);
            logger.body(`Directory cleaned: ${CONFIG.path.dist}`);
            const localPackageConfig = yield readPackageJson("./package.json");
            const packageCreator = new PackageCreator(localPackageConfig);
            const packageConfig = packageCreator.config;
            packageCreator.createPackageJson(CONFIG.path.dist);
            const fileCopier = new FileCopier();
            fileCopier.copyFileToDirectory(path.join(".", "README.md"), CONFIG.path.dist);
            fileCopier.copyFileToDirectory(path.join(".", "LICENSE"), CONFIG.path.dist);
            const directoryCopier = new DirectoryCopier();
            yield directoryCopier.recursiveCopy(CONFIG.path.ts_input, CONFIG.path.ts_output);
            console.log("Files copied successfully.");
            const versionWriter = new VersionWriter();
            yield versionWriter.writeVersionToFile("VERSION", packageConfig.version);
            const tsCompiler = new TypeScriptCompiler();
            const tsFiles = [
                path.join(CONFIG.path.ts_input, "index.ts"),
            ];
            const outputDir = "./dist/js";
            yield tsCompiler.compile(tsFiles, outputDir);
            console.log("TypeScript compilation completed.");
        }
        catch (error) {
            console.error("An error occurred:", error);
        }
    });
}
main();
//# sourceMappingURL=index.js.map