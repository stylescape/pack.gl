/**
 * Provides functionality to load and manipulate JSON data from files and
 * directories. This class can be used in scenarios where configurations,
 * data storage, or inter-process communication involves JSON files.
 */
declare class JSONLoader {
    /**
     * Asynchronously loads JSON data from a file and returns it as a typed
     * object. This method parses the JSON file content into a TypeScript
     * type or interface.
     *
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to an object containing the parsed JSON data.
     * @throws {Error} If the file cannot be read or the data cannot be parsed as JSON.
     */
    loadJSON<T>(filePath: string): Promise<T>;
    /**
     * Asynchronously loads all JSON files from a specified directory and
     * returns an array of typed objects. Useful for loading batches of
     * configuration files or similar datasets.
     *
     * @param dirPath The path to the directory containing JSON files.
     * @returns A promise that resolves to an array of objects containing the parsed JSON data.
     * @throws {Error} If the directory cannot be read or if there's an error parsing any of the files.
     */
    loadJSONFromDirectory<T>(dirPath: string): Promise<T[]>;
    /**
     * Merges an array of objects into a single object. This method is
     * particularly useful when combining settings or configurations from
     * multiple JSON files into a single configuration object.
     *
     * @param objects An array of objects to merge.
     * @returns A single object containing all properties from the input objects.
     */
    mergeJSONObjects<T>(objects: T[]): Promise<T>;
}
export default JSONLoader;
