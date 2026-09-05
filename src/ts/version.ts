// ============================================================================
// Constants
// ============================================================================

/**
 * The kist version, reported by `kist --version`.
 *
 * Kept as a constant rather than read from `package.json` at run time: the
 * published CLI is ESM and resolving its own manifest from `dist` is fragile
 * across package managers and bundlers. `npm run version:bump` rewrites this
 * file alongside `package.json`, `VERSION`, and the changelog, and
 * `tst/version.test.ts` fails if they drift apart.
 */
export const VERSION = "0.1.79";
