// ============================================================================
// Import
// ============================================================================

import fs from "fs/promises";
import path from "path";
import packageConfig from "../../config/package.config.js"




// ============================================================================
// Classes
// ============================================================================

/**
 * Provides functionality to programmatically create and write package.json
 * files using a flexible configuration. This class is ideal for automating
 * the setup of Node.js projects or managing configurations dynamically.
 */
class PackageCreator {

    // Parameters
    // ========================================================================

    /**
     *  Configuration for the Package.json.
     */
    // public config: any;
    public config: Record<string, any>;
    // private config: ts.CompilerOptions;
    // private config: { [key: symbol]: any};
 
    /**
     * Default configuration sourced from an external configuration file.
     */
    // private static defaultConfig: any = packageConfig;
    private static defaultConfig: Record<string, any> = packageConfig;


    // Constructor
    // ========================================================================

    /**
     * Constructs an instance with merged default and custom configuration
     * settings for package.json.
     * 
     * @param customConfig Custom settings to override or augment the default
     * package configuration.
     */
    constructor(
        customConfig: any = {},
        // customConfig: ts.CompilerOptions = {},
    ) {
        let newConfig = {
            // Populate with necessary fields from packageData
            name: customConfig.name,
            version: customConfig.version,
            description: customConfig.description,
            keywords: customConfig.keywords,
            author: customConfig.author,
            contributors: customConfig.contributors,
            license: customConfig.license,
            homepage: customConfig.homepage,
            repository: customConfig.repository,
            funding: customConfig.funding,
            bin: customConfig.bin,
            dependencies: customConfig.dependencies,
            exports: customConfig.exports,
        }
         this.config = {
             ...PackageCreator.defaultConfig,
             ...newConfig
         };
     }
    

    // Methods
    // ========================================================================

    /**
     * Creates a package.json file with the stored configuration in the
     * specified directory. If the directory does not exist, it will be
     * created.
     * 
     * @param outputDir The directory where the package.json will be created.
     * @returns A promise that resolves when the file has been successfully
     *  written.
     */
    async createPackageJson(
        outputDir: string
    ): Promise<void> {

        const filePath = path.join(
            outputDir,
            "package.json"
        );

        const data = JSON.stringify(
            this.config,
            null,
            2
        );

        try {

            // Ensure the output directory exists
            await this.ensureDirectoryExists(outputDir);

            // Write the package.json file
            await fs.writeFile(filePath, data, "utf-8");
            console.log(`package.json created at ${filePath}`);

        } catch (error) {
            console.error(`Error creating package.json: ${error}`);
            throw error;
        }
    }

    /**
     * Ensures the specified directory exists. If it does not, it will be
     * created.
     * 
     * @param dirPath The path of the directory to verify or create.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            // Check if error is an instance of NodeJS.ErrnoException
            if (
                error instanceof Error && (
                    error as NodeJS.ErrnoException
                ).code !== "EEXIST"
            ) {
                // Rethrow if it"s not a "directory exists" error
                throw error;
            }
        }
    }
    
}


// ============================================================================
// Export
// ============================================================================

export default PackageCreator;


// ============================================================================
// Example
// ============================================================================

// import PackageCreator from "./PackageCreator";

// const customConfig = {
//     name: "my-new-project",
//     version: "1.0.0",
//     description: "A new Node.js project",
//     author: "Developer Name"
// };

// const packageCreator = new PackageCreator(customConfig);
// const outputDirectory = "./path/to/project";

// packageCreator.createPackageJson(outputDirectory)
//     .then(() => console.log("Package.json has been successfully created."))
//     .catch(error => console.error("Error creating package.json:", error));
