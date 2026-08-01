// ============================================================================
// Configuration Exports
// ============================================================================

/**
 * Barrel export for kist's configuration subsystem: {@link ConfigLoader}
 * locates and parses `kist.yaml`/`kist.yml` (resolving `extends`
 * inheritance), {@link ConfigStore} is the singleton holding the merged,
 * effective configuration for the running process, and {@link defaultConfig}
 * is the baseline `ConfigStore` starts from before any file or CLI overrides
 * are merged in.
 */

export { ConfigLoader } from "./ConfigLoader.js";
export { ConfigStore } from "./ConfigStore.js";
export { defaultConfig } from "./defaultConfig.js";
