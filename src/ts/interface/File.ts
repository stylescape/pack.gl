// ============================================================================
// Interfaces
// ============================================================================

/**
 * Interface for representing a file within the system.
 * This interface is used to define the structure of file data objects
 * that include both the file path and its source content.
 */
export interface File {

    /**
     * The full path to the file.
     * This should include the complete directory path and the file name with its extension.
     */
    filepath: string;

    /**
     * The source content of the file.
     * This could be any form of text, such as code, configuration, or plain text.
     */
    source: string;

}
