/**
 * Handles reading SVG files from the filesystem. This class can be used in applications
 * that need to process or analyze SVG content programmatically, such as in graphics
 * processing tools, web servers, or content management systems.
 */
declare class SvgReader {
    /**
     * Reads the content of an SVG file asynchronously.
     * This method is useful for applications that need to load and manipulate SVG graphics,
     * perhaps for rendering or further processing.
     *
     * @param filePath The path to the SVG file.
     * @returns A promise that resolves to the content of the SVG file as a string.
     * @throws Throws an error if the file cannot be read, which might occur due to issues
     *         like file not existing or access permissions.
     */
    readSVG(filePath: string): Promise<string>;
}
export default SvgReader;
