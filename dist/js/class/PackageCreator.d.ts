/**
 * A class for creating a package.json file for a project.
 */
declare class PackageCreator {
    /**
     *  Configuration for the Package.json.
     */
    config: any;
    /**
     * Default configuration for Package.json.
     */
    private static defaultConfig;
    /**
     * Initializes a new instance of the PackageCreator class.
     * @param {PackageJson} customConfig - The content to be written into package.json.
     */
    constructor(customConfig?: any);
    /**
     * Creates a package.json file in the specified directory.
     * Creates the directory if it does not exist.
     * @param outputDir - The directory where package.json will be created.
     */
    createPackageJson(outputDir: string): Promise<void>;
    /**
     * Ensures that the given directory exists. Creates it if it does not exist.
     * @param dirPath - The path of the directory to check and create.
     */
    private ensureDirectoryExists;
}
export default PackageCreator;
