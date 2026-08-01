// ============================================================================
// Cache Module
// ============================================================================

/**
 * Barrel export for kist's opt-in build caching (`options.cache.enabled` in
 * the pipeline config): {@link FileCache} tracks per-file content hashes to
 * detect unchanged inputs, and {@link BuildCache} stores/restores the
 * outputs a step produced for a given input hash so unchanged work can be
 * skipped entirely.
 */

export { FileCache } from "./FileCache.js";
export { BuildCache } from "./BuildCache.js";
