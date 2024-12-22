// ============================================================================
// Import
// ============================================================================

import { promises as fsPromises } from "fs";
import path from "path";


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality for creating directory structures within a given
 * base path. This class helps in setting up directories for new projects or
 * ensuring that necessary directory structures are in place for file
 * operations.
 */
 class DirectoryCreator {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Asynchronously creates multiple directories based on a provided list of
     * paths. Directories are created within a specified base path. If
     * directories already exist, the operation skips those directories,
     * preventing any disruption of existing content.
     *
     * @param basePath The base path where directories will be created,
     * relative or absolute.
     * @param directories An array of directory paths to create relative to
     * the base path.
     * @description Each directory is processed individually to ensure
     * creation or validate existence. This method uses the "recursive"
     * option to create all necessary parent directories.
     * @throws {Error} An error is thrown if there is a failure in creating
     * any directory.
     */
    async createDirectories(
        basePath: string,
        directories: string[]
    ): Promise<void> {
        try {
            for (const dir of directories) {
                const dirPath = path.join(basePath, dir);
                await fsPromises.mkdir(dirPath, { recursive: true });
                // console.log(`Directory created or already exists: ${dirPath}`);
            }
        } catch (error) {
            console.error(`Error creating directories: ${error}`);
            throw error;
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default DirectoryCreator;


// ============================================================================
// Example
// ============================================================================

// import DirectoryCreator from "./DirectoryGenerator";

// const directoryCreator = new DirectoryCreator();
// const basePath = "./project";
// const directories = ["src", "src/assets", "docs"];

// directoryCreator.createDirectories(basePath, directories)
//     .then(() => console.log("All specified directories have been created."))
//     .catch(error => console.error("Failed to create directories:", error));