// ============================================================================
// Interfaces
// ============================================================================

// export interface Svg {
//     metadata: {
//     name: string;
//     // ... other metadata properties
//     };
//     source: string;
//     // ... other Svg properties
// }

/**
 * Represents the metadata associated with an SVG graphic.
 */
interface SvgMetadata {
    // The name of the SVG graphic.
    name: string;
    // Optional creator of the SVG graphic.
    creator?: string;
    // Optional description of the SVG graphic.
    description?: string;
    // Optional license information for the SVG graphic.
    license?: string;
}

/**
 * Represents an SVG (Scalable Vector Graphics) object.
 */
export interface Svg {
    // Metadata associated with the SVG.
    metadata: SvgMetadata;
    // The SVG content as a string.
    source: string;
    // Optional width of the SVG graphic.
    width?: number;
    // Optional height of the SVG graphic.
    height?: number;
    // Optional 'viewBox' attribute that defines the position and dimension,
    // in user space, of an SVG viewport.
    viewBox?: string;
    // Optional array of path data (for more detailed manipulation or data
    // extraction).
    paths?: SvgPath[];
}

/**
 * Represents the path element within an SVG, detailing its specific properties.
 */
interface SvgPath {
    // Path data (the "d" attribute).
    d: string;
    // Optional fill color.
    fill?: string;
    // Optional stroke color.
    stroke?: string;
    // Optional stroke width.
    strokeWidth?: number;
}

/**
 * Example usage of the Svg interface.
 */
const exampleSvg: Svg = {
    metadata: {
        name: "Example SVG",
        creator: "Example Creator",
        description: "A sample SVG file",
        license: "MIT",
    },
    source: '<svg width="100" height="100">...</svg>',
    width: 100,
    height: 100,
    viewBox: "0 0 100 100",
    paths: [
        {
            d: "M10 10 H 90 V 90 H 10 L 10 10",
            fill: "none",
            stroke: "black",
            strokeWidth: 2,
        },
    ],
};
