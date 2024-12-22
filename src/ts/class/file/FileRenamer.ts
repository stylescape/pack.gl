// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import path from "path";


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality for renaming files within the file system. This
 * class ensures that file renaming operations are handled smoothly and
 * includes comprehensive error management to address
 * potential issues such as file accessibility or conflicts.
 */
 class FileRenamer {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Renames a file from its current path to a new path. This operation is
     * atomic on most file systems, which means it is either completed fully
     * or not done at all, preventing partial updates.
     * 
     * @param srcPath The current path of the file to be renamed.
     * @param targetPath The new path where the file will be renamed.
     * @returns A Promise that resolves when the file has been successfully
     * renamed, or rejects if an error occurs.
     * @throws {Error} Errors could include "ENOENT" if the source file does
     * not exist, or "EACCES" if permission is denied.
     */
    async renameFile(
        srcPath: string,
        targetPath: string
    ): Promise<void> {
        try {
            await fs.promises.rename(srcPath, targetPath);
            console.log(`File renamed from ${srcPath} to ${targetPath}`);
        } catch (error) {
            console.error("Error renaming file:", error);
            throw error;
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default FileRenamer;


// ============================================================================
// Example
// ============================================================================

// import FileRenamer from "./FileRenamer";

// const renamer = new FileRenamer();
// const srcPath = "./path/to/original/file.txt";
// const targetPath = "./path/to/new/file.txt";

// renamer.renameFile(srcPath, targetPath)
//     .then(() => console.log("File successfully renamed."))
//     .catch(error => console.error("Failed to rename file:", error));

