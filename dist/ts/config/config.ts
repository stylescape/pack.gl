// config/config.ts

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


// ============================================================================
// Constants
// ============================================================================

/**
 * Central configuration object for managing paths used across various build and development processes.
 * This object helps in routing inputs and outputs to correct locations, ensuring a seamless build experience.
 */
const CONFIG = {
    path: {
        src: './src',                           // Source directory for raw files
        dist: './dist',                         // Distribution directory for built files

        svg_input: './src/svg',                 // Input directory for SVG files
        svg_output: './dist/svg',               // Output directory for processed SVG files
        sprite_input: './dist/svg',             // Input directory for generating sprites
        sprite_output: './dist/sprite',         // Output directory for generated sprites
        font_input: './dist/svg',               // Input directory for font generation
        font_output: './dist/font',             // Output directory for generated fonts
        scss_input: './src/scss',               // Input directory for SCSS files
        scss_output: './dist/scss',             // Output directory for compiled SCSS files
        css_output: './dist/css',               // Output directory for final CSS files
        json_output: './dist',                  // Directory for output JSON files
        ts_input: './src/ts',                   // Input directory for TypeScript files
        ts_output: './dist/ts',                 // Output directory for compiled TypeScript files
        ts_output_icons: './src/ts/icons',      // Output directory for TypeScript icon components
        js_output: './dist/js',                 // Output directory for JavaScript files
    },

};


// ============================================================================
// Export
// ============================================================================

export default CONFIG;
