"use strict";
// class/DirectoryGenerator.ts
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
// ============================================================================
// Import
// ============================================================================
const fs_1 = require("fs");
const path_1 = require("path");
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides functionality for creating directory structures within a given
 * base path. This class helps in setting up directories for new projects or
 * ensuring that necessary directory structures are in place for file
 * operations.
 */
class DirectoryCreator {
    /**
     * Asynchronously creates multiple directories based on a provided list of
     * paths. Directories are created within a specified base path. If
     * directories already exist, the operation skips those directories,
     * preventing any disruption of existing content.
     *
     * @param basePath The base path where directories will be created, relative or absolute.
     * @param directories An array of directory paths to create relative to the base path.
     * @description Each directory is processed individually to ensure creation or validate existence.
     *              This method uses the "recursive" option to create all necessary parent directories.
     * @throws {Error} An error is thrown if there is a failure in creating any directory.
     */
    createDirectories(basePath, directories) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const dir of directories) {
                    const dirPath = path_1.default.join(basePath, dir);
                    yield fs_1.promises.mkdir(dirPath, { recursive: true });
                    // console.log(`Directory created or already exists: ${dirPath}`);
                }
            }
            catch (error) {
                console.error(`Error creating directories: ${error}`);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryCreator;
// ============================================================================
// Example
// ============================================================================
// import DirectoryCreator from "./DirectoryGenerator";
// const directoryCreator = new DirectoryCreator();
// const basePath = "./project";
// const directories = ["src", "src/assets", "docs"];
// directoryCreator.createDirectories(basePath, directories)
//     .then(() => console.log("All specified directories have been created."))
//     .catch(error => console.error("Failed to create directories:", error));
