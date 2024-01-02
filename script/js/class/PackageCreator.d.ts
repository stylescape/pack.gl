declare class PackageCreator {
    private packageJson;
    constructor(packageJson: PackageJson);
    createPackageJson(outputDir: string): Promise<void>;
}
export default PackageCreator;
