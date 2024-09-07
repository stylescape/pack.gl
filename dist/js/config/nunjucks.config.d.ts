/**
 * Configuration options for Nunjucks to ensure safe and efficient template rendering.
 * This setup is ideal for both development and production environments, providing a balance
 * between performance optimizations and security best practices.
 */
declare const nunjucksConfig: {
    autoescape: boolean;
    throwOnUndefined: boolean;
    trimBlocks: boolean;
    lstripBlocks: boolean;
    noCache: boolean;
};
export default nunjucksConfig;
