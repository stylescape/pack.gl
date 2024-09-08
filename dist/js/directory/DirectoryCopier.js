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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides functionality to copy all files and subdirectories from one
 * directory to another, including handling of nested directories. This class
 * uses asynchronous operations to handle file operations efficiently.
 */
class DirectoryCopier {
    /**
     * Asynchronously copies all files and subdirectories from the source
     * directory to the destination directory. If the destination directory
     * does not exist, it will be created.
     *
     * @param srcDir The path of the source directory.
     * @param destDir The path of the destination directory.
     * @throws {Error} If any file or directory could not be copied.
     */
    copyFiles(srcDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resolvedSrcDir = path_1.default.resolve(srcDir);
                const resolvedDestDir = path_1.default.resolve(destDir);
                yield this.recursiveCopy(resolvedSrcDir, resolvedDestDir);
                console.log(`Files copied from ${resolvedSrcDir} to ${resolvedDestDir}`);
            }
            catch (error) {
                console.error("Error copying files:", error);
                throw error;
            }
        });
    }
    /**
     * Recursively copies files and directories from the source to the
     * destination directory.
     * This method creates the destination directory if it does not exist and
     * recursively copies all nested files and directories.
     *
     * @param srcDir Source directory.
     * @param destDir Destination directory.
     */
    recursiveCopy(srcDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.promises.mkdir(destDir, { recursive: true });
            const entries = yield fs_1.promises.readdir(srcDir, { withFileTypes: true });
            for (let entry of entries) {
                const srcPath = path_1.default.join(srcDir, entry.name);
                const destPath = path_1.default.join(destDir, entry.name);
                entry.isDirectory() ?
                    yield this.recursiveCopy(srcPath, destPath) :
                    yield fs_1.promises.copyFile(srcPath, destPath);
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryCopier;
// ============================================================================
// Example
// ============================================================================
// import DirectoryCopier from "./DirectoryCopier";
// const copier = new DirectoryCopier();
// copier.copyFiles("./path/to/source", "./path/to/destination")
//     .then(() => console.log("Copying completed successfully."))
//     .catch(error => console.error("Copying failed:", error));
