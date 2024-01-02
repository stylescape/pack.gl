declare class FileCopier {
    copyFileToDirectory(srcFile: string, destDir: string): Promise<void>;
}
export default FileCopier;
