/**
 * Reads and parses the package.json file.
 * @param packageJsonPath - The path to the package.json file.
 * @returns The parsed package.json object.
 */
declare function readPackageJson(packageJsonPath: string): Promise<any>;
export default readPackageJson;
