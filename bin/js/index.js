import { __awaiter } from "tslib";
import DirectoryCleaner from "./class/directory/DirectoryCleaner";
import DirectoryCopier from "./class/directory/DirectoryCopier";
import DirectoryCreator from "./class/directory/DirectoryCreator";
import DirectoryScanner from "./class/directory/DirectoryScanner";
import FileCopier from "./class/file/FileCopier";
import FilenameExtractor from "./class/file/FilenameExtractor";
import FileRenamer from "./class/file/FileRenamer";
import FontGenerator from "./class/FontGenerator.js";
import PackageCreator from "./class/package/PackageCreator.js";
import StyleProcessor from "./class/sass/StyleProcessor.js";
import VersionManager from "./class/version/VersionManager.js";
import VersionWriter from "./class/version/VersionWriter.js";
import JavaScriptMinifier from "./class/javascript/JavaScriptMinifier.js";
import TypeScriptCompiler from "./class/javascript/TypeScriptCompiler.js";
import NpmCommandRunner from "./class/NpmCommandRunner.js";
import StylizedLogger from "./class/StylizedLogger.js";
import TemplateWriter from "./class/TemplateWriter.js";
import SvgPackager from "./class/svg/SvgPackager.js";
import SvgReader from "./class/svg/SvgReader.js";
import SvgSpriteGenerator from "./class/svg/SvgSpriteGenerator.js";
import SvgToPngConverter from "./class/svg/SvgToPngConverter.js";
import CodeLinter from "./class/javascript/CodeLinter.js";
import DocumentationGenerator from "./class/javascript/DocumentationGenerator.js";
import JSONLoader from "./class/JSONLoader.js";
import TestRunner from "./class/TestRunner.js";
import path from "path";
export { DirectoryCleaner, DirectoryCopier, DirectoryCreator, DirectoryScanner, FileCopier, FilenameExtractor, FileRenamer };
export { CodeLinter, DocumentationGenerator, FontGenerator, JavaScriptMinifier, JSONLoader, NpmCommandRunner, PackageCreator, StyleProcessor, StylizedLogger, SvgPackager, SvgReader, SvgSpriteGenerator, SvgToPngConverter, TemplateWriter, TestRunner, TypeScriptCompiler, VersionManager, VersionWriter };
import cleanDirectory from "./utils/clean_directory";
import gl_installer from "./utils/gl_installer";
import readPackageJson from "./utils/readPackageJson.js";
export { cleanDirectory, gl_installer, readPackageJson };
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