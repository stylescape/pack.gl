declare class DirectoryCleaner {
    /**
     * Recursively deletes all contents of the directory asynchronously.
     * @param dirPath The path to the directory to clean.
     */
    cleanDirectory(dirPath: string): Promise<void>;
}
export default DirectoryCleaner;
