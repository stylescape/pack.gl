"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var DirectoryCleaner_js_1 = __importDefault(require("../class/DirectoryCleaner.js"));
var StylizedLogger_js_1 = __importDefault(require("../class/StylizedLogger.js"));
// import CONFIG from '../path/to/config.js'; // Assuming CONFIG is imported from a config file
const directoryCleaner = new DirectoryCleaner_js_1.default();
const logger = new StylizedLogger_js_1.default();
/**
 * Cleans a specified directory and logs the process.
 * @param directoryPath - The path of the directory to clean.
 */
async function cleanDirectory(directoryPath) {
    try {
        logger.header('Clean Directories');
        await directoryCleaner.cleanDirectory(directoryPath);
        logger.body(`Directory cleaned: ${directoryPath}`);
    }
    catch (error) {
        logger.error(`Error cleaning directory: ${error}`);
        throw error; // Rethrow the error for further handling if necessary
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = cleanDirectory;
// Usage example
// cleanAndLogDirectory(CONFIG.path.dist)
//     .then(() => console.log('Directory cleaning completed.'))
//     .catch(error => console.error(error));
