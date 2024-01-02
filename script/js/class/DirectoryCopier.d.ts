declare class DirectoryCopier {
    copyFiles(srcDir: string, destDir: string): Promise<void>;
    recursiveCopy(srcDir: string, destDir: string): Promise<void>;
}
export default DirectoryCopier;
