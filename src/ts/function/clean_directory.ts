import DirectoryCleaner from '../class/DirectoryCleaner.js';
import StylizedLogger from '../class/StylizedLogger.js';
import CONFIG from '../path/to/config.js'; // Assuming CONFIG is imported from a config file

const directoryCleaner = new DirectoryCleaner();
const logger = new StylizedLogger();

/**
 * Cleans a specified directory and logs the process.
 * @param directoryPath - The path of the directory to clean.
 */
async function cleanDirectory(directoryPath: string): Promise<void> {
    try {
        logger.header('Clean Directories');
        await directoryCleaner.cleanDirectory(directoryPath);
        logger.body(`Directory cleaned: ${directoryPath}`);
    } catch (error) {
        logger.error(`Error cleaning directory: ${error}`);
        throw error; // Rethrow the error for further handling if necessary
    }
}

// ============================================================================
// Export
// ============================================================================

export default cleanDirectory;


// Usage example
// cleanAndLogDirectory(CONFIG.path.dist)
//     .then(() => console.log('Directory cleaning completed.'))
//     .catch(error => console.error(error));
