// config/postcss.config.expanded.ts

// Copyright 2024 Scape Agency BV

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
// Import
// ============================================================================

import autoprefixer from 'autoprefixer'; // Automatically adds vendor prefixes to CSS rules
import cssnano from 'cssnano';
// import postcssSimpleVars from 'postcss-simple-vars'; // Plugin to handle CSS variables
// import postcssNested from 'postcss-nested'; // Plugin to allow nesting of CSS rules
// import postcssImport from 'postcss-import'; // Plugin to inline import CSS files into a single CSS


// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration object for PostCSS that focuses on generating expanded, readable CSS
 * for development environments. Includes plugins that enhance CSS handling like nesting,
 * variable support, and import inlining, alongside autoprefixer for browser compatibility.
 */
const postcssConfigExpanded = {
    plugins: [
        autoprefixer,
        // Include other plugins suited for the expanded output
    ]
    // plugins: [
    //     postcssImport(),  // Allows importing of other CSS files within a CSS file
    //     autoprefixer(),   // Adds vendor prefixes to CSS, using data from Can I Use
    //     postcssSimpleVars(), // Enables the use of Sass-like variables in CSS
    //     postcssNested(),  // Process nested rules, which is similar to how Sass handles nesting
    //     // cssnano({
    //     //     preset: 'default', // Optionally include for light compression or reformatting
    //     // }),
    // ]
};


// ============================================================================
// Export
// ============================================================================

export default postcssConfigExpanded;


/**
 * Note: This configuration is intended for development use where extended readability
 * and ease of debugging are critical. The cssnano plugin is commented out by default
 * to keep the output CSS as clean and readable as possible; it can be enabled for
 * environments that require slightly more optimized output without full minification.
 */