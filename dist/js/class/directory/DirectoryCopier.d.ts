/**
 * Provides functionality to copy all files and subdirectories from one
 * directory to another, including handling of nested directories. This class
 * uses asynchronous operations to handle file operations efficiently.
 */
declare class DirectoryCopier {
    /**
     * Asynchronously copies all files and subdirectories from the source
     * directory to the destination directory. If the destination directory
     * does not exist, it will be created.
     *
     * @param srcDir The path of the source directory.
     * @param destDir The path of the destination directory.
     * @throws {Error} If any file or directory could not be copied.
     */
    copyFiles(srcDir: string, destDir: string): Promise<void>;
    /**
     * Recursively copies files and directories from the source to the
     * destination directory.
     * This method creates the destination directory if it does not exist and
     * recursively copies all nested files and directories.
     *
     * @param srcDir Source directory.
     * @param destDir Destination directory.
     */
    recursiveCopy(srcDir: string, destDir: string): Promise<void>;
}
export default DirectoryCopier;
