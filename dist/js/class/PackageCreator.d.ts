import { PackageJson } from '../interface/PackageJson.js';
/**
 * A class for creating a package.json file for a project.
 */
declare class PackageCreator {
    private packageJson;
    /**
     * Initializes a new instance of the PackageCreator class.
     * @param {PackageJson} packageJson - The content to be written into package.json.
     */
    constructor(packageJson: PackageJson);
    /**
     * Creates a package.json file in the specified directory.
     * @param {string} outputDir - The directory where package.json will be created.
     */
    createPackageJson(outputDir: string): Promise<void>;
}
export default PackageCreator;
