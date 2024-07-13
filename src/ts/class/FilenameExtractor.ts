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

class FilenameExtractor {

    /**
     * Extracts the filename without its extension from a file path.
     * @param filePath The full path of the file.
     * @returns The filename without its extension.
     */
    getFilenameWithoutExtension(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

}


// ============================================================================
// Export
// ============================================================================

export default FilenameExtractor;
