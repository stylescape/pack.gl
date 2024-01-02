/**
 * A class for copying files from one location to another.
 */
declare class FileCopier {
    /**
     * Copies a single file to a specified destination directory.
     * @param {string} srcFile - The path of the source file to copy.
     * @param {string} destDir - The destination directory where the file should be copied.
     * @throws Will throw an error if the file copy operation fails.
     */
    copyFileToDirectory(srcFile: string, destDir: string): Promise<void>;
}
export default FileCopier;
