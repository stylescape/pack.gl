/**
 * A class for renaming files.
 */
declare class FileRenamer {
    /**
     * Renames a file from the source path to the target path.
     * @param srcPath The current path of the file.
     * @param targetPath The new path of the file after renaming.
     * @returns Promise<void>
     */
    renameFile(srcPath: string, targetPath: string): Promise<void>;
}
export default FileRenamer;
