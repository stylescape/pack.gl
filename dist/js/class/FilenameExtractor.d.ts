declare class FilenameExtractor {
    /**
     * Extracts the filename without its extension from a file path.
     * @param filePath The full path of the file.
     * @returns The filename without its extension.
     */
    getFilenameWithoutExtension(filePath: string): string;
}
export default FilenameExtractor;
