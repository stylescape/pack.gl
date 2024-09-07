/**
 * Provides methods to extract filenames and components from paths, focusing
 * on removing file extensions. This class can be particularly useful in
 * applications where file handling is a common task, such as in data
 * processing, file management systems, or when generating output files with
 * modified names.
 */
declare class FilenameExtractor {
    /**
     * Retrieves the file name from a full file path, excluding the file
     * extension. This method utilizes the Node.js `path` module to parse and
     * extract the file name, ensuring compatibility with various file system
     * path formats.
     *
     * @param filePath The full path of the file from which the name should be extracted.
     * @returns The file name without its extension, as a string.
     */
    getFilenameWithoutExtension(filePath: string): string;
}
export default FilenameExtractor;
