declare class SvgPackager {
    processSvgFiles(directory: string, outputDirectory: string, ts_output_directory: string, json_output_directory: string): Promise<void>;
    private readSvgFile;
    private sanitizeFileName;
    private optimizeSvg;
    private writeTypeScriptFile;
    private writeSvgFile;
    private writeIconsJson;
}
export default SvgPackager;
