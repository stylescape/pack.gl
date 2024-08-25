// class/DirectoryCleaner.ts


// ============================================================================
// Import
// ============================================================================

// import { promises as fsPromises } from "fs";
import path from "path";
import fs from "fs";

// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality to clean directories by recursively deleting their
 * contents.
 * This includes all files and subdirectories contained within.
 */
class DirectoryCleaner {

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
    public cleanDirectory(dirPath: string): void {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(file => {
                const curPath = path.join(dirPath, file);

                if (fs.lstatSync(curPath).isDirectory()) { // Recurse
                    this.cleanDirectory(curPath);
                } else { // Delete file
                    fs.unlinkSync(curPath);
                }
            });

            fs.rmdirSync(dirPath);
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCleaner;


// ============================================================================
// Example
// ============================================================================

// import DirectoryCleaner from "./DirectoryCleaner";

// const cleaner = new DirectoryCleaner();

// try {
//     cleaner.cleanDirectory("./path/to/directory");
//     console.log("Directory cleaned successfully.");
// } catch (error) {
//     console.error("Failed to clean directory:", error);
// }
