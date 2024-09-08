"use strict";
// ============================================================================
// Imports
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
const fs_1 = require("fs"); // More explicit and consistent import style
const path_1 = __importDefault(require("path"));
// ============================================================================
// Functions
// ============================================================================
/**
 * Reads and parses the package.json file located at the specified path.
 * This function handles errors gracefully, providing specific messages for file
 * not found, JSON parsing errors, or other unexpected errors.
 *
 * @param packageJsonPath - The relative or absolute path to the package.json file.
 * @returns A promise that resolves to the parsed JSON object from the package.json file.
 * @throws {Error} Throws an error if the file cannot be read or if the content is not valid JSON.
 */
function readPackageJson(packageJsonPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullPath = path_1.default.resolve(packageJsonPath); // Resolves the path to an absolute path
        try {
            const fileContent = yield fs_1.promises.readFile(fullPath, 'utf-8');
            return JSON.parse(fileContent);
        }
        catch (error) {
            // Customize error message based on the error type
            if (error.code === 'ENOENT') {
                throw new Error(`File not found at ${fullPath}. Please ensure the path is correct.`);
            }
            else if (error.name === 'SyntaxError') {
                throw new Error(`Failed to parse JSON from ${fullPath}: ${error.message}`);
            }
            else {
                throw new Error(`An unexpected error occurred while reading ${fullPath}: ${error.message}`);
            }
        }
    });
}
// ============================================================================
// Export
// ============================================================================
exports.default = readPackageJson;
// ============================================================================
// Example Usage
// ============================================================================
// (async () => {
//     try {
//         const packageJson = await readPackageJson('./path/to/package.json');
//         console.log('Package JSON:', packageJson);
//     } catch (error) {
//         console.error('Failed to read package.json:', error.message);
//     }
// })();
