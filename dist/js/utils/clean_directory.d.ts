/**
 * Cleans the specified directory and logs the operation.
 * This function is asynchronous and will log details about the cleaning process,
 * including any errors that occur.
 *
 * @param directoryPath - The file system path to the directory to be cleaned.
 */
declare function cleanDirectory(directoryPath: string): Promise<void>;
export default cleanDirectory;
