// Assuming you're using ES6 module syntax
import fs from 'fs/promises';
import path from 'path';

/**
 * Reads and parses the package.json file.
 * @param packageJsonPath - The path to the package.json file.
 * @returns The parsed package.json object.
 */
async function readPackageJson(packageJsonPath: string) {
    const fullPath = path.resolve(packageJsonPath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent);
}

export default readPackageJson;
