// class/DirectoryCopier.ts

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

import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';


// ============================================================================
// Classes
// ============================================================================

/**
 * A class for copying files from one directory to another.
 */
class DirectoryCopier {

    /**
     * Copies all files and subdirectories from a source directory to a destination directory.
     * @param srcDir The source directory path.
     * @param destDir The destination directory path.
     * @throws Will throw an error if copying fails for any file or directory.
     */
     async copyFiles(srcDir: string, destDir: string): Promise<void> {
        try {
            const resolvedSrcDir = path.resolve(srcDir);
            const resolvedDestDir = path.resolve(destDir);
            await this.recursiveCopy(resolvedSrcDir, resolvedDestDir);
            console.log(`Files copied from ${resolvedSrcDir} to ${resolvedDestDir}`);
        } catch (error) {
            console.error('Error copying files:', error);
            throw error;
        }
    }

    /**
     * Recursively copies files and directories.
     * @param srcDir Source directory.
     * @param destDir Destination directory.
     */
    private async recursiveCopy(srcDir: string, destDir: string): Promise<void> {
        await fsPromises.mkdir(destDir, { recursive: true });
        const entries = await fsPromises.readdir(srcDir, { withFileTypes: true });

        for (let entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            entry.isDirectory() ? 
                await this.recursiveCopy(srcPath, destPath) : 
                await fsPromises.copyFile(srcPath, destPath);
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCopier;
