// ============================================================================
// Imports
// ============================================================================

import { promises as fs } from "fs";
import path from "path";


// ============================================================================
// Functions
// ============================================================================

/**
 * Reads and parses the package.json file located at the specified path.
 * This function handles errors gracefully, providing specific messages for
 * file not found, JSON parsing errors, or other unexpected errors.
 *
 * @param packageJsonPath - The relative or absolute path to the package.json
 * file.
 * @returns A promise that resolves to the parsed JSON object from the
 * package.json file.
 * @throws {Error} Throws an error if the file cannot be read or if the
 * content is not valid JSON.
 */
async function readPackageJson(
    packageJsonPath: string
): Promise<Record<string, unknown>> {

    // Resolves the path to an absolute path
    const fullPath = path.resolve(packageJsonPath);

    try {
        const fileContent = await fs.readFile(
            fullPath,
            "utf-8"
        );
        return JSON.parse(fileContent);
    } catch (error: any) {
        // Customize error message based on the error type
        if (error.code === "ENOENT") {
            throw new Error(
                `File not found at ${fullPath}. Please ensure the path is correct.`
            );
        } else if (error.name === "SyntaxError") {
            throw new Error(
                `Failed to parse JSON from ${fullPath}: ${error.message}`
            );
        } else {
            throw new Error(
                `An unexpected error occurred while reading ${fullPath}: ${error.message}`
            );
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default readPackageJson;


// ============================================================================
// Example Usage
// ============================================================================

// (async () => {
//     try {
//         const packageJson = await readPackageJson("./path/to/package.json");
//         console.log("Package JSON:", packageJson);
//     } catch (error) {
//         console.error("Failed to read package.json:", error.message);
//     }
// })();