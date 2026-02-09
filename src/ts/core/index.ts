// ============================================================================
// Core Module Exports
// ============================================================================

/**
 * Export core classes and modules for use in the application.
 * Ensure all essential components are listed here to provide a unified API.
 */

// Core Classes
export { Action } from "./pipeline/Action.js";
export { Pipeline } from "./pipeline/Pipeline.js";
export { PipelineManager } from "./pipeline/PipelineManager.js";
export { Stage } from "./pipeline/Stage.js";
export { Step } from "./pipeline/Step.js";

// Cache Modules
export { FileCache } from "./cache/FileCache.js";
export { BuildCache } from "./cache/BuildCache.js";

// Progress Modules
export {
    ProgressReporter,
    createFileProgress,
    createBuildProgress,
} from "./progress/ProgressReporter.js";

// Utility Functions and Modules
// If there are reusable utilities, add them here.
// Example:
// export { someUtilityFunction } from "./utils.js";

// Action Registry
// Export functions related to action registration and retrieval.
// export {
//     registerAction,
//     getAction,
//     listRegisteredActions
// } from "../actions/ActionRegistry.js";

/**
 * Note: If new modules or files are added in the `core` directory,
 * consider using an automated script to dynamically export them here.
 * Tools like `barrel` can help maintain such an index file efficiently.
 */
