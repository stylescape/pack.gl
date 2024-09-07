/**
 * Provides functionality for creating directory structures within a given
 * base path. This class helps in setting up directories for new projects or
 * ensuring that necessary directory structures are in place for file
 * operations.
 */
declare class DirectoryCreator {
    /**
     * Asynchronously creates multiple directories based on a provided list of
     * paths. Directories are created within a specified base path. If
     * directories already exist, the operation skips those directories,
     * preventing any disruption of existing content.
     *
     * @param basePath The base path where directories will be created, relative or absolute.
     * @param directories An array of directory paths to create relative to the base path.
     * @description Each directory is processed individually to ensure creation or validate existence.
     *              This method uses the "recursive" option to create all necessary parent directories.
     * @throws {Error} An error is thrown if there is a failure in creating any directory.
     */
    createDirectories(basePath: string, directories: string[]): Promise<void>;
}
export default DirectoryCreator;
