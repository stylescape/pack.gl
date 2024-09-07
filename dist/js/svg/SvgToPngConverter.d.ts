/**
 * A utility class for converting SVG images to PNG format. This class uses the `sharp` library
 * for image conversion and `jsdom` to manipulate SVG elements.
 */
declare class SvgToPngConverter {
    /**
     * Converts SVG content to a PNG file.
     * Optionally resizes the image to the specified width and height.
     *
     * @param {string} svgContent The SVG content to be converted.
     * @param {string} outputPath The filesystem path where the PNG should be saved.
     * @param {number} [width] Optional width to resize the resulting PNG.
     * @param {number} [height] Optional height to resize the resulting PNG.
     * @throws {Error} Throws an error if the conversion process fails.
     */
    convert(svgContent: string, outputPath: string, width?: number, height?: number): Promise<void>;
}
export default SvgToPngConverter;
