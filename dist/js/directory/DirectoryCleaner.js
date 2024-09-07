"use strict";
// class/DirectoryCleaner.ts
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================================
// Import
// ============================================================================
// import { promises as fsPromises } from "fs";
const path_1 = require("path");
const fs_1 = require("fs");
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides functionality to clean directories by recursively deleting their
 * contents.
 * This includes all files and subdirectories contained within.
 */
class DirectoryCleaner {
    /**
     * Recursively deletes all contents of a specified directory, including all
     * subdirectories and files.
     * The method first checks if the directory exists before proceeding.
     * If the directory does not exist, the method does nothing.
     *
     * @param dirPath The absolute or relative path to the directory to be
     * cleaned.
     * @throws {Error} Throws an error if deleting any file or directory fails.
     */
    cleanDirectory(dirPath) {
        if (fs_1.default.existsSync(dirPath)) {
            fs_1.default.readdirSync(dirPath).forEach(file => {
                const curPath = path_1.default.join(dirPath, file);
                if (fs_1.default.lstatSync(curPath).isDirectory()) { // Recurse
                    this.cleanDirectory(curPath);
                }
                else { // Delete file
                    fs_1.default.unlinkSync(curPath);
                }
            });
            fs_1.default.rmdirSync(dirPath);
        }
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryCleaner;
// ============================================================================
// Example
// ============================================================================
// import DirectoryCleaner from "./DirectoryCleaner";
// const cleaner = new DirectoryCleaner();
// try {
//     cleaner.cleanDirectory("./path/to/directory");
//     console.log("Directory cleaned successfully.");
// } catch (error) {
//     console.error("Failed to clean directory:", error);
// }
