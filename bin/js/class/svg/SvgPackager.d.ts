declare class SvgPackager {
    private svgoConfigPath;
    constructor(svgoConfigPath: string);
    processSvgFiles(inputDirectory: string, outputDirectory: string, ts_output_directory: string, json_output_directory: string): Promise<void>;
    private readSvgFile;
    private sanitizeFileName;
    private writeFiles;
    private optimizeSvg;
    private writeTypeScriptFile;
    private writeSvgFile;
    private writeIconsJson;
}
export default SvgPackager;
