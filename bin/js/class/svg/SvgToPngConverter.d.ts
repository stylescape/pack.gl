declare class SvgToPngConverter {
    convert(svgContent: string, outputPath: string, width?: number, height?: number): Promise<void>;
}
export default SvgToPngConverter;
