// class/DirectoryScanner.ts


// ============================================================================
// Import
// ============================================================================

import fs from "fs/promises";
import path from "path";


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides methods to scan directories and list contents, with the option to
 * include subdirectories recursively. Useful for applications that need to
 * process files dynamically or monitor directory changes.
 */
class DirectoryScanner {

    /**
     * Scans the specified directory and returns an array of file paths. It
     * can scan directories recursively to retrieve paths of all files within
     * the directory tree.
     *
     * @param dirPath The path to the directory to be scanned.
     * @param recursive Optional. If set to true, the method scans all subdirectories recursively.
     *                  Defaults to false.
     * @returns A promise that resolves with an array of file paths (strings), representing
     *          all files within the directory, or within the entire directory tree if recursive
     *          scanning is enabled.
     * @throws An error if the directory cannot be read, including permissions errors or if the 
     *         directory does not exist.
     */
    async scanDirectory(
        dirPath: string,
        recursive: boolean = false
    ): Promise<string[]> {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const files = await Promise.all(entries.map(async (entry) => {
                const resolvedPath = path.resolve(dirPath, entry.name);
                return entry.isDirectory() && recursive
                    ? this.scanDirectory(resolvedPath, true)
                    : resolvedPath;
            }));

            return files.flat();
        } catch (error) {
            console.error(`Error scanning directory: ${dirPath}`, error);
            throw error;
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default DirectoryScanner;


// ============================================================================
// Example
// ============================================================================

// import DirectoryScanner from "./DirectoryScanner";

// const scanner = new DirectoryScanner();
// scanner.scanDirectory("./path/to/directory", true)
//     .then(files => {
//         console.log("Scanned files:", files);
//     })
//     .catch(error => {
//         console.error("Failed to scan directory:", error);
//     });