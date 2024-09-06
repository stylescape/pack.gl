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
