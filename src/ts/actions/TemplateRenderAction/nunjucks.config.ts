// This configuration is tailored to a typical web application setup. Adjust the `noCache` option
// according to your caching strategy for production environments to optimize performance.

// ============================================================================
// Import
// ============================================================================

// Importing path for potential future use in specifying template directories
// or other file paths

// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration options for Nunjucks to ensure safe and efficient template
 * rendering. This setup is ideal for both development and production
 * environments, providing a balance between performance optimizations and
 * security best practices.
 */
const nunjucksConfig = {
    // Controls if output with dangerous characters are escaped automatically
    autoescape: true,
    // Throw errors when outputting a null/undefined value
    throwOnUndefined: false,
    // Automatically remove trailing newlines from a block/tag
    trimBlocks: true,
    // Automatically remove leading whitespace from a block/tag
    lstripBlocks: true,
    noCache: true,
};

// ============================================================================
// Export
// ============================================================================

export default nunjucksConfig;
