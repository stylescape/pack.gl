// class/DirectoryCopier.ts


// ============================================================================
// Import
// ============================================================================

import path from "path";
import { promises as fsPromises } from "fs";


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality to copy all files and subdirectories from one
 * directory to another, including handling of nested directories. This class
 * uses asynchronous operations to handle file operations efficiently.
 */
class DirectoryCopier {

    /**
     * Asynchronously copies all files and subdirectories from the source
     * directory to the destination directory. If the destination directory
     * does not exist, it will be created.
     *
     * @param srcDir The path of the source directory.
     * @param destDir The path of the destination directory.
     * @throws {Error} If any file or directory could not be copied.
     */
     async copyFiles(srcDir: string, destDir: string): Promise<void> {
        try {
            const resolvedSrcDir = path.resolve(srcDir);
            const resolvedDestDir = path.resolve(destDir);
            await this.recursiveCopy(resolvedSrcDir, resolvedDestDir);
            console.log(
                `Files copied from ${resolvedSrcDir} to ${resolvedDestDir}`
            );
        } catch (error) {
            console.error("Error copying files:", error);
            throw error;
        }
    }

    /**
     * Recursively copies files and directories from the source to the
     * destination directory.
     * This method creates the destination directory if it does not exist and
     * recursively copies all nested files and directories.
     *
     * @param srcDir Source directory.
     * @param destDir Destination directory.
     */
    async recursiveCopy(srcDir: string, destDir: string): Promise<void> {
        await fsPromises.mkdir(destDir, { recursive: true });
        const entries = await fsPromises.readdir(
            srcDir,
            { withFileTypes: true }
        );

        for (let entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            entry.isDirectory() ? 
                await this.recursiveCopy(srcPath, destPath) : 
                await fsPromises.copyFile(srcPath, destPath);
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCopier;


// ============================================================================
// Example
// ============================================================================

// import DirectoryCopier from "./DirectoryCopier";

// const copier = new DirectoryCopier();

// copier.copyFiles("./path/to/source", "./path/to/destination")
//     .then(() => console.log("Copying completed successfully."))
//     .catch(error => console.error("Copying failed:", error));
