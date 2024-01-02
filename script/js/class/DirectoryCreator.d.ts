declare class DirectoryCreator {
    createDirectories(basePath: string, directories: string[]): Promise<void>;
}
export default DirectoryCreator;
