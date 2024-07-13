// class/DirectoryScanner.ts

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

import fs from 'fs/promises';
import path from 'path';


// ============================================================================
// Classes
// ============================================================================

class DirectoryScanner {

    /**
     * Scans a directory and returns a list of file paths.
     * Can optionally scan directories recursively.
     * @param dirPath The directory to scan.
     * @param recursive Whether to scan directories recursively.
     * @returns A promise that resolves to an array of file paths.
     */
    async scanDirectory(
        dirPath: string,
        recursive: boolean = false
    ): Promise<string[]> {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const files = await Promise.all(entries.map(async (entry) => {
                const resolvedPath = path.resolve(dirPath, entry.name);
                return entry.isDirectory() && recursive
                    ? this.scanDirectory(resolvedPath, true)
                    : resolvedPath;
            }));

            return files.flat();
        } catch (error) {
            console.error(`Error scanning directory: ${dirPath}`, error);
            throw error;
        }
    }

}

// ============================================================================
// Export
// ============================================================================

export default DirectoryScanner;
