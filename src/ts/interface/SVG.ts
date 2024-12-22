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
    name: string;               // The name of the SVG graphic.
    creator?: string;           // Optional creator of the SVG graphic.
    description?: string;       // Optional description of the SVG graphic.
    license?: string;           // Optional license information for the SVG graphic.
}

/**
 * Represents an SVG (Scalable Vector Graphics) object.
 */
export interface Svg {
    metadata: SvgMetadata;      // Metadata associated with the SVG.
    source: string;             // The SVG content as a string.
    width?: number;             // Optional width of the SVG graphic.
    height?: number;            // Optional height of the SVG graphic.
    viewBox?: string;           // Optional 'viewBox' attribute that defines the position and dimension, in user space, of an SVG viewport.
    paths?: SvgPath[];          // Optional array of path data (for more detailed manipulation or data extraction).
}

/**
 * Represents the path element within an SVG, detailing its specific properties.
 */
interface SvgPath {
    d: string;                  // Path data (the "d" attribute).
    fill?: string;              // Optional fill color.
    stroke?: string;            // Optional stroke color.
    strokeWidth?: number;       // Optional stroke width.
}

/**
 * Example usage of the Svg interface.
 */
const exampleSvg: Svg = {
    metadata: {
        name: "Example SVG",
        creator: "Example Creator",
        description: "A sample SVG file",
        license: "MIT"
    },
    source: '<svg width="100" height="100">...</svg>',
    width: 100,
    height: 100,
    viewBox: "0 0 100 100",
    paths: [{
        d: "M10 10 H 90 V 90 H 10 L 10 10",
        fill: "none",
        stroke: "black",
        strokeWidth: 2
    }]
};