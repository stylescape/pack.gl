/**
 * Provides functionality to clean directories by recursively deleting their
 * contents.
 * This includes all files and subdirectories contained within.
 */
declare class DirectoryCleaner {
    /**
     * Recursively deletes all contents of a specified directory, including all
     * subdirectories and files.
     * The method first checks if the directory exists before proceeding.
     * If the directory does not exist, the method does nothing.
     *
     * @param dirPath The absolute or relative path to the directory to be
     * cleaned.
     * @throws {Error} Throws an error if deleting any file or directory fails.
     */
    cleanDirectory(dirPath: string): void;
}
export default DirectoryCleaner;
