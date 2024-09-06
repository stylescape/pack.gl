// ============================================================================
// Import
// ============================================================================

import path from 'node:path'


// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration for optimizing SVG files using SVGO.
 * It includes multiple passes to ensure thorough optimization and custom
 * plugins for specific attribute management.
 */
const svgoConfig = {

    multipass: true, // Optimize SVG files multiple times until no further optimizations can be made.
    js2svg: {
        pretty: true, // Make output more readable by formatting it.
        indent: 2,    // Number of spaces used for indentation of the resulting SVG file.
        eol: 'lf'     // End of line character, use 'lf' for UNIX-style line endings.
    },
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeUnknownsAndDefaults: {
                        // remove all `data` attributes
                        keepDataAttrs: false, // Do not keep data-* attributes since they are often not needed for display.
                        // keep the `role` attribute
                        keepRoleAttr: true    // Keep role attributes to maintain accessibility.
                    },

                    // keep the `viewBox` attribute
                    removeViewBox: false,   // Do not remove the viewBox attribute which is important for scaling.
        
                    // customize the params of a default plugin
                    inlineStyles: {
                        onlyMatchedOnce: false, // Apply styles even if matching elements occur more than once.
                    }
                }
            }
        },
        // The next plugins are included in svgo but are not part of preset-default,
        // so we need to explicitly enable them
        'cleanupListOfValues',  // Clean up values in attributes that take a list of numbers (like viewBox or enable-background).
        {
            name: 'removeAttrs',
            params: {
                attrs: ['clip-rule', 'fill'] // Remove these attributes as they are often unnecessary and can be controlled via CSS.
            }
        },
        // Custom plugin which resets the SVG attributes to explicit values
        {
            name: 'explicitAttrs',
            type: 'visitor',
            params: {
                attributes: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '16',
                    height: '16',
                    fill: 'currentColor', // Use 'currentColor' to allow SVG color to be specified by the color of the text.
                    class: '', // Base class attribute which will be extended dynamically.
                    viewBox: '0 0 16 16' // Default viewBox for all icons.
                }
            },
            fn(_root: any, params: { attributes: { [s: string]: unknown; } | ArrayLike<unknown>; }, info: { path: string; }) {
                if (!params.attributes) {
                    return null
                }
                const pathname = info.path
                const basename = path.basename(pathname, '.svg')
        
                return {
                    element: {
                        enter(node: { name: string; attributes: { [x: string]: unknown; }; }, parentNode: { type: string; }) {
                            if (node.name === 'svg' && parentNode.type === 'root') {
                                // We set the `svgAttributes` in the order we want to,
                                // hence why we remove the attributes and add them back
                                node.attributes = {}
                                for (const [key, value] of Object.entries(params.attributes)) {
                                    node.attributes[key] = key === 'class' ? `igl igl-${basename}` : value
                                }
                            }
                        }
                    }
                }
            }
        }
    ]
};


// ============================================================================
// Export
// ============================================================================

export default svgoConfig;
