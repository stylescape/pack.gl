import { __awaiter } from "tslib";
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
const directories = Object.values(CONFIG.path);
const spriteGenerator = new SvgSpriteGenerator(svgspriteConfig);
const tsCompiler = new TypeScriptCompiler(tsConfig);
const jsMinifier = new JavaScriptMinifier(tensorConfig);
const packageCreator = new PackageCreator(packageConfig);
const svgPackager = new SvgPackager();
const fontGenerator = new FontGenerator();
const styleProcessor = new StyleProcessor();
const versionWriter = new VersionWriter();
const fileCopier = new FileCopier();
const fileRenamer = new FileRenamer();
const directoryCopier = new DirectoryCopier();
const directoryCleaner = new DirectoryCleaner();
const directoryCreator = new DirectoryCreator();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            directoryCleaner.cleanDirectory(CONFIG.path.dist);
            console.log(`Directory cleaned: ${CONFIG.path.dist}`);
            console.log('Starting Directory creation...');
            yield directoryCreator.createDirectories('.', directories);
            try {
                yield directoryCopier.recursiveCopy(CONFIG.path.ts_input, CONFIG.path.ts_output);
                console.log('Files copied successfully.');
            }
            catch (error) {
                console.error('Error while copying files:', error);
            }
            yield versionWriter.writeVersionToFile('VERSION', packageConfig.version);
            yield packageCreator.createPackageJson(CONFIG.path.dist);
            try {
                const tsFiles = [
                    path.join(CONFIG.path.ts_input, 'index.ts'),
                ];
                const outputDir = './dist/js';
                console.log('Starting TypeScript compilation...');
                tsCompiler.compile(tsFiles, outputDir);
                console.log('TypeScript compilation completed.');
            }
            catch (error) {
                console.error('An error occurred:', error);
            }
            yield fileRenamer.renameFile(path.join(CONFIG.path.js_output, 'index.js'), path.join(CONFIG.path.js_output, 'pack.gl.js'));
            yield jsMinifier.minifyFile(path.join(CONFIG.path.js_output, 'pack.gl.js'), path.join(CONFIG.path.js_output, 'pack.gl.min.js'))
                .then(() => console.log('JavaScript minification completed.'))
                .catch(console.error);
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
main();
//# sourceMappingURL=index.js.map