declare class VersionWriter {
    writeVersionToFile(filePath: string, version: string): Promise<void>;
}
export default VersionWriter;
