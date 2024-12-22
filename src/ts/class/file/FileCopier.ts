// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import path from "path";


// ============================================================================
// Classes
// ============================================================================

/**
 * Handles the copying of files from one location to another, ensuring that
 * the operation is both safe and efficient. This class is particularly useful
 * for applications requiring file management capabilities, such as backup
 * systems or content management systems.
 */
 class FileCopier {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Copies a file from a specified source to a destination directory. This
     * method takes care of file path resolution and checks for existing files
     * in the destination, replacing them if necessary.
     *
     * @param {string} srcFile - The path of the source file to be copied.
     * @param {string} destDir - The destination directory where the file
     * should be placed.
     * @returns {Promise<void>} A promise that resolves when the file has
     * been successfully copied.
     * @throws {Error} If the file cannot be copied, including due to
     * permission errors or the source file not existing.
     */
    async copyFileToDirectory(
        srcFile: string,
        destDir: string
    ): Promise<void> {
        try {
            const fileName = path.basename(srcFile);
            const destFilePath = path.join(destDir, fileName);
            await fs.promises.copyFile(srcFile, destFilePath);
            console.log(`File copied from ${srcFile} to ${destFilePath}`);
        } catch (error) {
            console.error("Error copying file:", error);
            throw error;
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default FileCopier;


// ============================================================================
// Example
// ============================================================================

// import FileCopier from "./FileCopier";

// const copier = new FileCopier();
// const sourceFile = "./path/to/source/file.txt";
// const destinationDir = "./path/to/destination";

// copier.copyFileToDirectory(sourceFile, destinationDir)
//     .then(() => console.log("File copying completed successfully."))
//     .catch(error => console.error("Failed to copy file:", error));