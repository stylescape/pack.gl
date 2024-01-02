/**
 * A class for writing version information to a file.
 */
declare class VersionWriter {
    /**
     * Writes the specified version string to a file.
     * @param {string} filePath - The file path where the version will be written.
     * @param {string} version - The version string to write to the file.
     */
    writeVersionToFile(filePath: string, version: string): Promise<void>;
}
export default VersionWriter;
