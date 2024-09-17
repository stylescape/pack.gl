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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides methods to scan directories and list contents, with the option to
 * include subdirectories recursively. Useful for applications that need to
 * process files dynamically or monitor directory changes.
 */
class DirectoryScanner {
    /**
     * Scans the specified directory and returns an array of file paths. It
     * can scan directories recursively to retrieve paths of all files within
     * the directory tree.
     *
     * @param dirPath The path to the directory to be scanned.
     * @param recursive Optional. If set to true, the method scans all subdirectories recursively.
     *                  Defaults to false.
     * @returns A promise that resolves with an array of file paths (strings), representing
     *          all files within the directory, or within the entire directory tree if recursive
     *          scanning is enabled.
     * @throws An error if the directory cannot be read, including permissions errors or if the
     *         directory does not exist.
     */
    scanDirectory(dirPath_1) {
        return __awaiter(this, arguments, void 0, function* (dirPath, recursive = false) {
            try {
                const entries = yield promises_1.default.readdir(dirPath, { withFileTypes: true });
                const files = yield Promise.all(entries.map((entry) => __awaiter(this, void 0, void 0, function* () {
                    const resolvedPath = path_1.default.resolve(dirPath, entry.name);
                    return entry.isDirectory() && recursive
                        ? this.scanDirectory(resolvedPath, true)
                        : resolvedPath;
                })));
                return files.flat();
            }
            catch (error) {
                console.error(`Error scanning directory: ${dirPath}`, error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = DirectoryScanner;
// ============================================================================
// Example
// ============================================================================
// import DirectoryScanner from "./DirectoryScanner";
// const scanner = new DirectoryScanner();
// scanner.scanDirectory("./path/to/directory", true)
//     .then(files => {
//         console.log("Scanned files:", files);
//     })
//     .catch(error => {
//         console.error("Failed to scan directory:", error);
//     });
