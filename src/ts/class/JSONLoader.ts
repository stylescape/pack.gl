// class/JSONLoader.ts

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

import { promises as fs } from 'fs';
import path from 'path';


// ============================================================================
// Classes
// ============================================================================

class JSONLoader {
    /**
     * Asynchronously loads JSON data from a file and returns it as an object.
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to an object containing the JSON data.
     */
    async loadJSON<T>(filePath: string): Promise<T> {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Error reading JSON file: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Asynchronously loads all JSON files from a given directory.
     * @param dirPath The path to the directory containing JSON files.
     * @returns A promise that resolves to an array of objects containing the JSON data.
     */
     async loadJSONFromDirectory<T>(dirPath: string): Promise<T[]> {
        try {
            const files = await fs.readdir(dirPath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            const jsonData = await Promise.all(
                jsonFiles.map(file =>
                    this.loadJSON<T>(path.join(dirPath, file))
                )
            );

            return jsonData;
        } catch (error) {
            console.error(`Error reading JSON files from directory: ${dirPath}`, error);
            throw error;
        }
    }

    /**
     * Merges an array of objects into a single object.
     * @param objects An array of objects to merge.
     * @returns A single object containing all properties from the input objects.
     */
    async mergeJSONObjects<T>(objects: T[]): Promise<T> {
        return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
    }
}


// ============================================================================
// Export
// ============================================================================

export default JSONLoader;