/**
 * A utility class for writing version information to a specified file,
 * commonly used in software development for managing and tracking software
 * version releases.
 */
declare class VersionWriter {
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
    writeVersionToFile(filePath: string, version: string): Promise<void>;
}
export default VersionWriter;
