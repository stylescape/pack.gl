"use strict";
// ============================================================================
// Import
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autoprefixer_1 = __importDefault(require("autoprefixer")); // Handles CSS vendor prefixing automatically
const cssnano_1 = __importDefault(require("cssnano")); // A PostCSS plugin for CSS minimization
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
        autoprefixer_1.default, // Automatically adds vendor prefixes to CSS rules
        (0, cssnano_1.default)({
            preset: 'default' // Uses the default settings for compression
        }),
    ]
};
// ============================================================================
// Export
// ============================================================================
exports.default = postcssConfigCompressed;
