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
const DirectoryCleaner_js_1 = __importDefault(require("../class/directory/DirectoryCleaner.js"));
const StylizedLogger_js_1 = __importDefault(require("../class/StylizedLogger.js"));
// ============================================================================
// Constants
// ============================================================================
// Create instances of DirectoryCleaner and StylizedLogger
const directoryCleaner = new DirectoryCleaner_js_1.default();
const logger = new StylizedLogger_js_1.default();
// ============================================================================
// Functions
// ============================================================================
/**
 * Cleans the specified directory and logs the operation.
 * This function is asynchronous and will log details about the cleaning process,
 * including any errors that occur.
 *
 * @param directoryPath - The file system path to the directory to be cleaned.
 */
function cleanDirectory(directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger.header('Clean Directories');
            yield directoryCleaner.cleanDirectory(directoryPath);
            logger.body(`Directory cleaned: ${directoryPath}`);
        }
        catch (error) {
            logger.error(`Error cleaning directory: ${error}`);
            throw error; // Rethrow the error for further handling if necessary
        }
    });
}
// ============================================================================
// Export
// ============================================================================
exports.default = cleanDirectory;
// ============================================================================
// Example
// ============================================================================
// cleanDirectory('path/to/directory')
//     .then(() => console.log('Directory cleaning completed successfully.'))
//     .catch(error => console.error('Directory cleaning failed:', error));
