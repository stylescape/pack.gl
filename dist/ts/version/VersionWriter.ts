// ============================================================================
// Import
// ============================================================================

import { promises as fs } from "fs";


// ============================================================================
// Classes
// ============================================================================

/**
 * A utility class for writing version information to a specified file,
 * commonly used in software development for managing and tracking software
 * version releases.
 */
class VersionWriter {

    /**
     * Writes a version string to a specified file path. This method is
     * asynchronous and uses Node.js"s filesystem promises to handle the
     * file writing operation.
     *
     * @param {string} filePath The file path where the version information
     * should be written.
     * @param {string} version The version string to be written to the file.
     * @returns {Promise<void>} A promise that resolves when the version has
     * been successfully written.
     * @throws {Error} Throws an error if the file writing operation fails.
     */
    async writeVersionToFile(
        filePath: string,
        version: string,
    ): Promise<void> {
        try {
            await fs.writeFile(filePath, version, "utf8");
            console.log(`Version ${version} written to ${filePath}`);
        } catch (error) {
            console.error(`Error writing version to file: ${error}`);
        }
    }

}


// ============================================================================
// Export
// ============================================================================

export default VersionWriter;


// ============================================================================
// Example
// ============================================================================


// Here is an example of how you might use the VersionWriter class:

// import VersionWriter from "./VersionWriter";

// const versionWriter = new VersionWriter();
// const filePath = "./VERSION.txt";
// const version = "1.0.3";

// versionWriter.writeVersionToFile(filePath, version)
//     .then(() => console.log("Version information updated."))
//     .catch(error => console.error("Failed to update version information:", error));
