declare class DirectoryScanner {
    /**
     * Scans a directory and returns a list of file paths.
     * Can optionally scan directories recursively.
     * @param dirPath The directory to scan.
     * @param recursive Whether to scan directories recursively.
     * @returns A promise that resolves to an array of file paths.
     */
    scanDirectory(dirPath: string, recursive?: boolean): Promise<string[]>;
}
export default DirectoryScanner;
