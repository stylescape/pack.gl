// interface/Svg.ts

// Copyright 2023 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


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