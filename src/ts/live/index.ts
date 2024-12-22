// ============================================================================
// Live Reload Core - Entry Point
// ============================================================================

// Export core classes for live reload functionality
export { LiveReloadServer } from "./LiveReloadServer"; // Manages server operations and live reload communication
export { FileWatcher } from "./FileWatcher"; // Watches for file changes and triggers reload actions

// Future-proofing: Add additional exports as the project evolves
// Example:
// export { AnotherFeature } from "./AnotherFeature";

// Note:
// This file serves as a central export hub, enabling cleaner and more modular imports
// for users of the library. Group related exports if the codebase grows further.