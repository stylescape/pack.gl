import { __awaiter } from "tslib";
import fs from "fs/promises";
import path from "path";
import packageConfig from "../../config/package.config.js";
class PackageCreator {
    constructor(customConfig = {}) {
        let newConfig = {
            name: customConfig.name,
            version: customConfig.version,
            description: customConfig.description,
            keywords: customConfig.keywords,
            author: customConfig.author,
            contributors: customConfig.contributors,
            license: customConfig.license,
            homepage: customConfig.homepage,
            repository: customConfig.repository,
            funding: customConfig.funding,
            bin: customConfig.bin,
            dependencies: customConfig.dependencies,
            exports: customConfig.exports,
        };
        this.config = Object.assign(Object.assign({}, PackageCreator.defaultConfig), newConfig);
    }
    createPackageJson(outputDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.join(outputDir, "package.json");
            const data = JSON.stringify(this.config, null, 2);
            try {
                yield this.ensureDirectoryExists(outputDir);
                yield fs.writeFile(filePath, data, "utf-8");
                console.log(`package.json created at ${filePath}`);
            }
            catch (error) {
                console.error(`Error creating package.json: ${error}`);
                throw error;
            }
        });
    }
    ensureDirectoryExists(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.mkdir(dirPath, { recursive: true });
            }
            catch (error) {
                if (error instanceof Error &&
                    error.code !== "EEXIST") {
                    throw error;
                }
            }
        });
    }
}
PackageCreator.defaultConfig = packageConfig;
export default PackageCreator;
//# sourceMappingURL=PackageCreator.js.map