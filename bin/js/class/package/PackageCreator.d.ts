declare class PackageCreator {
    config: Record<string, any>;
    private static defaultConfig;
    constructor(customConfig?: any);
    createPackageJson(outputDir: string): Promise<void>;
    private ensureDirectoryExists;
}
export default PackageCreator;
