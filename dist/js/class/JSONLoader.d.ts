declare class JSONLoader {
    /**
     * Asynchronously loads JSON data from a file and returns it as an object.
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to an object containing the JSON data.
     */
    loadJSON<T>(filePath: string): Promise<T>;
    /**
     * Asynchronously loads all JSON files from a given directory.
     * @param dirPath The path to the directory containing JSON files.
     * @returns A promise that resolves to an array of objects containing the JSON data.
     */
    loadJSONFromDirectory<T>(dirPath: string): Promise<T[]>;
    /**
     * Merges an array of objects into a single object.
     * @param objects An array of objects to merge.
     * @returns A single object containing all properties from the input objects.
     */
    mergeJSONObjects<T>(objects: T[]): Promise<T>;
}
export default JSONLoader;
