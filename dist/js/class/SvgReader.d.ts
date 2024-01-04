declare class SvgReader {
    /**
     * Reads the content of an SVG file asynchronously.
     * @param filePath The path to the SVG file.
     * @returns A promise that resolves to the content of the SVG file.
     */
    readSVG(filePath: string): Promise<string>;
}
export default SvgReader;
