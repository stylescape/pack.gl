declare class PackageCreator {
    config: any;
    private static defaultConfig;
    constructor(customConfig?: any);
    createPackageJson(outputDir: string): Promise<void>;
    private ensureDirectoryExists;
}
export default PackageCreator;
