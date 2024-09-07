"use strict";
// class/VersionWriter.ts
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
// ============================================================================
// Classes
// ============================================================================
/**
 * A utility class for writing version information to a specified file,
 * commonly used in software development for managing and tracking software
 * version releases.
 */
class VersionWriter {
    /**
     * Writes a version string to a specified file path. This method is asynchronous
     * and uses Node.js"s filesystem promises to handle the file writing operation.
     *
     * @param {string} filePath The file path where the version information should be written.
     * @param {string} version The version string to be written to the file.
     * @returns {Promise<void>} A promise that resolves when the version has been successfully written.
     * @throws {Error} Throws an error if the file writing operation fails.
     */
    writeVersionToFile(filePath, version) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.promises.writeFile(filePath, version, "utf8");
                console.log(`Version ${version} written to ${filePath}`);
            }
            catch (error) {
                console.error(`Error writing version to file: ${error}`);
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = VersionWriter;
// ============================================================================
// Example
// ============================================================================
// Here is an example of how you might use the VersionWriter class:
// import VersionWriter from "./VersionWriter";
// const versionWriter = new VersionWriter();
// const filePath = "./VERSION.txt";
// const version = "1.0.3";
// versionWriter.writeVersionToFile(filePath, version)
//     .then(() => console.log("Version information updated."))
//     .catch(error => console.error("Failed to update version information:", error));
