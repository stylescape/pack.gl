declare class DirectoryScanner {
    scanDirectory(dirPath: string, recursive?: boolean): Promise<string[]>;
}
export default DirectoryScanner;
