/**
 * Provides functionality to programmatically create and write package.json
 * files using a flexible configuration. This class is ideal for automating
 * the setup of Node.js projects or managing configurations dynamically.
 */
declare class PackageCreator {
    /**
     *  Configuration for the Package.json.
     */
    config: Record<string, any>;
    /**
     * Default configuration sourced from an external configuration file.
     */
    private static defaultConfig;
    /**
     * Constructs an instance with merged default and custom configuration
     * settings for package.json.
     *
     * @param customConfig Custom settings to override or augment the default
     * package configuration.
     */
    constructor(customConfig?: any);
    /**
     * Creates a package.json file with the stored configuration in the
     * specified directory. If the directory does not exist, it will be
     * created.
     *
     * @param outputDir The directory where the package.json will be created.
     * @returns A promise that resolves when the file has been successfully
     *  written.
     */
    createPackageJson(outputDir: string): Promise<void>;
    /**
     * Ensures the specified directory exists. If it does not, it will be
     * created.
     *
     * @param dirPath The path of the directory to verify or create.
     */
    private ensureDirectoryExists;
}
export default PackageCreator;
