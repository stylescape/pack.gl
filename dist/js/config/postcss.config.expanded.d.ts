import autoprefixer from 'autoprefixer';
/**
 * Configuration object for PostCSS that focuses on generating expanded, readable CSS
 * for development environments. Includes plugins that enhance CSS handling like nesting,
 * variable support, and import inlining, alongside autoprefixer for browser compatibility.
 */
declare const postcssConfigExpanded: {
    plugins: (typeof autoprefixer)[];
};
export default postcssConfigExpanded;
/**
 * Note: This configuration is intended for development use where extended readability
 * and ease of debugging are critical. The cssnano plugin is commented out by default
 * to keep the output CSS as clean and readable as possible; it can be enabled for
 * environments that require slightly more optimized output without full minification.
 */ 
