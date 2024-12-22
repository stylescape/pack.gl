// ============================================================================
// Import
// ============================================================================

import path from "path";


// ============================================================================
// Classes
// ============================================================================

/**
 * Provides methods to extract filenames and components from paths, focusing
 * on removing file extensions. This class can be particularly useful in
 * applications where file handling is a common task, such as in data
 * processing, file management systems, or when generating output files with
 * modified names.
 */
class FilenameExtractor {

    // Parameters
    // ========================================================================


    // Constructor
    // ========================================================================


    // Methods
    // ========================================================================

    /**
     * Retrieves the file name from a full file path, excluding the file
     * extension. This method utilizes the Node.js `path` module to parse and
     * extract the file name, ensuring compatibility with various file system
     * path formats.
     *
     * @param filePath The full path of the file from which the name should
     * be extracted.
     * @returns The file name without its extension, as a string.
     */
    getFilenameWithoutExtension(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

}


// ============================================================================
// Export
// ============================================================================

export default FilenameExtractor;


// ============================================================================
// Example
// ============================================================================

// import FilenameExtractor from "./FilenameExtractor";

// const extractor = new FilenameExtractor();
// const filePath = "/path/to/file.txt";
// const filename = extractor.getFilenameWithoutExtension(filePath);

// console.log("Filename without extension:", filename);
