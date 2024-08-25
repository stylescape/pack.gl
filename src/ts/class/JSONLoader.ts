// class/JSONLoader.ts


// ============================================================================
// Import
// ============================================================================

import { promises as fs } from 'fs';
import path from 'path';


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality to load and manipulate JSON data from files and
 * directories. This class can be used in scenarios where configurations,
 * data storage, or inter-process communication involves JSON files.
 */
class JSONLoader {

    /**
     * Asynchronously loads JSON data from a file and returns it as a typed
     * object. This method parses the JSON file content into a TypeScript
     * type or interface.
     *
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to an object containing the parsed JSON data.
     * @throws {Error} If the file cannot be read or the data cannot be parsed as JSON.
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
     * Asynchronously loads all JSON files from a specified directory and
     * returns an array of typed objects. Useful for loading batches of
     * configuration files or similar datasets.
     *
     * @param dirPath The path to the directory containing JSON files.
     * @returns A promise that resolves to an array of objects containing the parsed JSON data.
     * @throws {Error} If the directory cannot be read or if there's an error parsing any of the files.
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
     * Merges an array of objects into a single object. This method is
     * particularly useful when combining settings or configurations from
     * multiple JSON files into a single configuration object.
     *
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


// ============================================================================
// Example
// ============================================================================

// import JSONLoader from './JSONLoader';

// const loader = new JSONLoader();
// const filePath = './config/settings.json';
// const dirPath = './configs';

// loader.loadJSON(filePath)
//     .then(config => console.log('Loaded JSON:', config))
//     .catch(error => console.error('Failed to load JSON file:', error));

// loader.loadJSONFromDirectory(dirPath)
//     .then(configs => {
//         console.log('Loaded multiple JSON configurations:', configs);
//         return loader.mergeJSONObjects(configs);
//     })
//     .then(mergedConfig => console.log('Merged Configuration:', mergedConfig))
//     .catch(error => console.error('Failed to load or merge configurations:', error));