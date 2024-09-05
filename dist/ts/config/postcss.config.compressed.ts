// config/postcss.config.compressed.ts

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

import autoprefixer from 'autoprefixer'; // Handles CSS vendor prefixing automatically
import cssnano from 'cssnano'; // A PostCSS plugin for CSS minimization


// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration object for PostCSS that includes plugins for optimization and compression
 * of CSS. This setup is typically used for production builds where minimized CSS is preferred
 * to reduce file size and improve loading times.
 */
const postcssConfigCompressed = {
    plugins: [
        autoprefixer, // Automatically adds vendor prefixes to CSS rules
        cssnano({     // Compresses CSS output
            preset: 'default' // Uses the default settings for compression
        }),
    ]
};


// ============================================================================
// Export
// ============================================================================

export default postcssConfigCompressed;
