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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Handles the copying of files from one location to another, ensuring that
 * the operation is both safe and efficient. This class is particularly useful
 * for applications requiring file management capabilities, such as backup
 * systems or content management systems.
 */
class FileCopier {
    /**
     * Copies a file from a specified source to a destination directory. This method takes care of
     * file path resolution and checks for existing files in the destination, replacing them if necessary.
     *
     * @param {string} srcFile - The path of the source file to be copied.
     * @param {string} destDir - The destination directory where the file should be placed.
     * @returns {Promise<void>} A promise that resolves when the file has been successfully copied.
     * @throws {Error} If the file cannot be copied, including due to permission errors or the source file not existing.
     */
    copyFileToDirectory(srcFile, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileName = path_1.default.basename(srcFile);
                const destFilePath = path_1.default.join(destDir, fileName);
                yield fs_1.default.promises.copyFile(srcFile, destFilePath);
                console.log(`File copied from ${srcFile} to ${destFilePath}`);
            }
            catch (error) {
                console.error("Error copying file:", error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = FileCopier;
// ============================================================================
// Example
// ============================================================================
// import FileCopier from "./FileCopier";
// const copier = new FileCopier();
// const sourceFile = "./path/to/source/file.txt";
// const destinationDir = "./path/to/destination";
// copier.copyFileToDirectory(sourceFile, destinationDir)
//     .then(() => console.log("File copying completed successfully."))
//     .catch(error => console.error("Failed to copy file:", error));
