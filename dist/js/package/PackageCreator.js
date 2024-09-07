"use strict";
// ============================================================================
// Import
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const package_config_js_1 = require("../config/package.config.js");
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides functionality to programmatically create and write package.json
 * files using a flexible configuration. This class is ideal for automating
 * the setup of Node.js projects or managing configurations dynamically.
 */
class PackageCreator {
    /**
     * Constructs an instance with merged default and custom configuration
     * settings for package.json.
     *
     * @param customConfig Custom settings to override or augment the default
     * package configuration.
     */
    constructor(customConfig = {}) {
        let newConfig = {
            // Populate with necessary fields from packageData
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
            dependencies: customConfig.dependencies,
            exports: customConfig.exports,
        };
        this.config = Object.assign(Object.assign({}, PackageCreator.defaultConfig), newConfig);
    }
    /**
     * Creates a package.json file with the stored configuration in the
     * specified directory. If the directory does not exist, it will be
     * created.
     *
     * @param outputDir The directory where the package.json will be created.
     * @returns A promise that resolves when the file has been successfully
     *  written.
     */
    createPackageJson(outputDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.default.join(outputDir, 'package.json');
            const data = JSON.stringify(this.config, null, 2);
            try {
                // Ensure the output directory exists
                yield this.ensureDirectoryExists(outputDir);
                // Write the package.json file
                yield promises_1.default.writeFile(filePath, data, 'utf-8');
                console.log(`package.json created at ${filePath}`);
            }
            catch (error) {
                console.error(`Error creating package.json: ${error}`);
                throw error;
            }
        });
    }
    /**
     * Ensures the specified directory exists. If it does not, it will be
     * created.
     *
     * @param dirPath The path of the directory to verify or create.
     */
    ensureDirectoryExists(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promises_1.default.mkdir(dirPath, { recursive: true });
            }
            catch (error) {
                // Check if error is an instance of NodeJS.ErrnoException
                if (error instanceof Error && error.code !== 'EEXIST') {
                    // Rethrow if it's not a 'directory exists' error
                    throw error;
                }
            }
        });
    }
}
// private config: ts.CompilerOptions;
// private config: { [key: symbol]: any};
/**
 * Default configuration sourced from an external configuration file.
 */
PackageCreator.defaultConfig = package_config_js_1.default;
// ============================================================================
// Export
// ============================================================================
exports.default = PackageCreator;
// ============================================================================
// Example
// ============================================================================
// import PackageCreator from './PackageCreator';
// const customConfig = {
//     name: "my-new-project",
//     version: "1.0.0",
//     description: "A new Node.js project",
//     author: "Developer Name"
// };
// const packageCreator = new PackageCreator(customConfig);
// const outputDirectory = "./path/to/project";
// packageCreator.createPackageJson(outputDirectory)
//     .then(() => console.log("Package.json has been successfully created."))
//     .catch(error => console.error("Error creating package.json:", error));
