// class/DirectoryCleaner.ts

// Copyright 2024 Scape Agency BV

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

// import { promises as fsPromises } from 'fs';
import path from 'path';
import fs from 'fs';

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
    public cleanDirectory(dirPath: string): void {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(file => {
                const curPath = path.join(dirPath, file);

                if (fs.lstatSync(curPath).isDirectory()) { // Recurse
                    this.cleanDirectory(curPath);
                } else { // Delete file
                    fs.unlinkSync(curPath);
                }
            });

            fs.rmdirSync(dirPath);
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCleaner;


// ============================================================================
// Example
// ============================================================================

// import DirectoryCleaner from './DirectoryCleaner';

// const cleaner = new DirectoryCleaner();

// try {
//     cleaner.cleanDirectory('./path/to/directory');
//     console.log('Directory cleaned successfully.');
// } catch (error) {
//     console.error('Failed to clean directory:', error);
// }
