declare class FileRenamer {
    renameFile(srcPath: string, targetPath: string): Promise<void>;
}
export default FileRenamer;
