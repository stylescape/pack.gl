declare class JSONLoader {
    loadJSON<T>(filePath: string): Promise<T>;
    loadJSONFromDirectory<T>(dirPath: string): Promise<T[]>;
    mergeJSONObjects<T>(objects: T[]): Promise<T>;
}
export default JSONLoader;
