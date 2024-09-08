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
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides functionality for renaming files within the file system. This
 * class ensures that file renaming operations are handled smoothly and
 * includes comprehensive error management to address
 * potential issues such as file accessibility or conflicts.
 */
class FileRenamer {
    /**
     * Renames a file from its current path to a new path. This operation is
     * atomic on most file systems, which means it is either completed fully
     * or not done at all, preventing partial updates.
     *
     * @param srcPath The current path of the file to be renamed.
     * @param targetPath The new path where the file will be renamed.
     * @returns A Promise that resolves when the file has been successfully renamed, or rejects if an error occurs.
     * @throws {Error} Errors could include "ENOENT" if the source file does not exist, or "EACCES" if permission is denied.
     */
    renameFile(srcPath, targetPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.default.promises.rename(srcPath, targetPath);
                console.log(`File renamed from ${srcPath} to ${targetPath}`);
            }
            catch (error) {
                console.error("Error renaming file:", error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = FileRenamer;
// ============================================================================
// Example
// ============================================================================
// import FileRenamer from "./FileRenamer";
// const renamer = new FileRenamer();
// const srcPath = "./path/to/original/file.txt";
// const targetPath = "./path/to/new/file.txt";
// renamer.renameFile(srcPath, targetPath)
//     .then(() => console.log("File successfully renamed."))
//     .catch(error => console.error("Failed to rename file:", error));
