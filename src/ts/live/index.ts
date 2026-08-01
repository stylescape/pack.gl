// ============================================================================
// Live Reload Core - Entry Point
// ============================================================================

/**
 * Barrel export for kist's live-reload subsystem: {@link LiveServer} (serves
 * the output directory and pushes reload signals over WebSocket) and
 * {@link LiveWatcher} (watches source paths with chokidar and invokes a
 * callback on change). Enabled via `options.live.enabled` in the pipeline
 * configuration.
 */

// Export core classes for live reload functionality

// Manages server operations and live reload communication
export { LiveServer } from "./LiveServer.js";

// Watches for file changes and triggers reload actions
export { LiveWatcher } from "./LiveWatcher.js";
