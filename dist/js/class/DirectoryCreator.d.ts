/**
 * A class for creating directories.
 */
declare class DirectoryCreator {
    /**
     * Creates directories at the specified locations asynchronously.
     * @param basePath The base path where directories will be created.
     * @param directories An array of directory paths to create.
     * @description This method iterates over the provided array of directory paths,
     *              creating each directory at the specified location within the base path.
     *              If a directory already exists, it skips creation. This is useful for
     *              setting up a project structure or ensuring necessary directories are
     *              available before performing file operations.
     * @throws Will throw an error if directory creation fails.
     */
    createDirectories(basePath: string, directories: string[]): Promise<void>;
}
export default DirectoryCreator;
