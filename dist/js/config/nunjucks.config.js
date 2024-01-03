"use strict";
// config/nunjucks.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================================
// Constants
// ============================================================================
const nunjucksConfig = {
    autoescape: true, // Controls if output with dangerous characters are escaped automatically
    throwOnUndefined: false, // Throw errors when outputting a null/undefined value
    trimBlocks: true, // Automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // Automatically remove leading whitespace from a block/tag
    noCache: true
};
// ============================================================================
// Export
// ============================================================================
exports.default = nunjucksConfig;
