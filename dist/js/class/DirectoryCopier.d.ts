/**
 * A class for copying files from one directory to another.
 */
declare class DirectoryCopier {
    /**
     * Copies all files and subdirectories from a source directory to a destination directory.
     * @param srcDir The source directory path.
     * @param destDir The destination directory path.
     * @throws Will throw an error if copying fails for any file or directory.
     */
    copyFiles(srcDir: string, destDir: string): Promise<void>;
    /**
     * Recursively copies files and directories.
     * @param srcDir Source directory.
     * @param destDir Destination directory.
     */
    recursiveCopy(srcDir: string, destDir: string): Promise<void>;
}
export default DirectoryCopier;
