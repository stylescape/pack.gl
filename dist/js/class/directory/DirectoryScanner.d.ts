/**
 * Provides methods to scan directories and list contents, with the option to
 * include subdirectories recursively. Useful for applications that need to
 * process files dynamically or monitor directory changes.
 */
declare class DirectoryScanner {
    /**
     * Scans the specified directory and returns an array of file paths. It
     * can scan directories recursively to retrieve paths of all files within
     * the directory tree.
     *
     * @param dirPath The path to the directory to be scanned.
     * @param recursive Optional. If set to true, the method scans all subdirectories recursively.
     *                  Defaults to false.
     * @returns A promise that resolves with an array of file paths (strings), representing
     *          all files within the directory, or within the entire directory tree if recursive
     *          scanning is enabled.
     * @throws An error if the directory cannot be read, including permissions errors or if the
     *         directory does not exist.
     */
    scanDirectory(dirPath: string, recursive?: boolean): Promise<string[]>;
}
export default DirectoryScanner;
