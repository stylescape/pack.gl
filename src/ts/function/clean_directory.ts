// config/fantasticon.config.ts

// Copyright 2023 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// ============================================================================
// Import
// ============================================================================

import DirectoryCleaner from '../class/DirectoryCleaner.js';
import StylizedLogger from '../class/StylizedLogger.js';


// ============================================================================
// Constants
// ============================================================================

const directoryCleaner = new DirectoryCleaner();
const logger = new StylizedLogger();


// ============================================================================
// Functions
// ============================================================================

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
