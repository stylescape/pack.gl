// class/FilenameExtractor.ts

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

import path from 'path';


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides methods to extract filenames and components from paths, focusing on removing file extensions.
 * This class can be particularly useful in applications where file handling is a common task, such as
 * in data processing, file management systems, or when generating output files with modified names.
 */
class FilenameExtractor {

    /**
     * Retrieves the file name from a full file path, excluding the file extension.
     * This method utilizes the Node.js `path` module to parse and extract the file name,
     * ensuring compatibility with various file system path formats.
     *
     * @param filePath The full path of the file from which the name should be extracted.
     * @returns The file name without its extension, as a string.
     */
    getFilenameWithoutExtension(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

}


// ============================================================================
// Export
// ============================================================================

export default FilenameExtractor;


// ============================================================================
// Example
// ============================================================================

// import FilenameExtractor from './FilenameExtractor';

// const extractor = new FilenameExtractor();
// const filePath = '/path/to/file.txt';
// const filename = extractor.getFilenameWithoutExtension(filePath);

// console.log('Filename without extension:', filename);
