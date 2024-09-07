/**
 * Reads and parses the package.json file located at the specified path.
 * This function handles errors gracefully, providing specific messages for file
 * not found, JSON parsing errors, or other unexpected errors.
 *
 * @param packageJsonPath - The relative or absolute path to the package.json file.
 * @returns A promise that resolves to the parsed JSON object from the package.json file.
 * @throws {Error} Throws an error if the file cannot be read or if the content is not valid JSON.
 */
declare function readPackageJson(packageJsonPath: string): Promise<Record<string, unknown>>;
export default readPackageJson;
