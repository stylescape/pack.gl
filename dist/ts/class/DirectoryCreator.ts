// class/DirectoryGenerator.ts

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

import { promises as fsPromises } from 'fs';
import path from 'path';



// ============================================================================
// Classes
// ============================================================================

/**
 * A class for creating directories.
 */

 class DirectoryCreator {
    /**
     * Creates directories at the specified locations asynchronously.
     * @param basePath The base path where directories will be created.
     * @param directories An array of directory paths to create.
     * @description This method iterates over the provided array of directory paths, 
     *              creating each directory at the specified location within the base path. 
     *              If a directory already exists, it skips creation. This is useful for 
     *              setting up a project structure or ensuring necessary directories are 
     *              available before performing file operations.
     * @throws Will throw an error if directory creation fails.
     */
    async createDirectories(basePath: string, directories: string[]): Promise<void> {
        try {
            for (const dir of directories) {
                const dirPath = path.join(basePath, dir);
                await fsPromises.mkdir(dirPath, { recursive: true });
                // console.log(`Directory created or already exists: ${dirPath}`);
            }
        } catch (error) {
            console.error(`Error creating directories: ${error}`);
            throw error;
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCreator;