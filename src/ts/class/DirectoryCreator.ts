// class/DirectoryGenerator.ts

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

import { promises as fsPromises } from 'fs';
import path from 'path';


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality for creating directory structures within a given base path.
 * This class helps in setting up directories for new projects or ensuring that
 * necessary directory structures are in place for file operations.
 */
 class DirectoryCreator {

    /**
     * Asynchronously creates multiple directories based on a provided list of paths.
     * Directories are created within a specified base path. If directories already exist,
     * the operation skips those directories, preventing any disruption of existing content.
     *
     * @param basePath The base path where directories will be created, relative or absolute.
     * @param directories An array of directory paths to create relative to the base path.
     * @description Each directory is processed individually to ensure creation or validate existence.
     *              This method uses the 'recursive' option to create all necessary parent directories.
     * @throws {Error} An error is thrown if there is a failure in creating any directory.
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


// ============================================================================
// Example
// ============================================================================

// import DirectoryCreator from './DirectoryGenerator';

// const directoryCreator = new DirectoryCreator();
// const basePath = './project';
// const directories = ['src', 'src/assets', 'docs'];

// directoryCreator.createDirectories(basePath, directories)
//     .then(() => console.log('All specified directories have been created.'))
//     .catch(error => console.error('Failed to create directories:', error));