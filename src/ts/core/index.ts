// ============================================================================
// Core Module Exports
// ============================================================================

/**
 * Export core classes and modules for use in the application.
 * Ensure all essential components are listed here to provide a unified API.
 */

// Core Classes
export { Action } from "./pipeline/Action";
export { Pipeline } from "./pipeline/Pipeline";
export { PipelineManager } from "./pipeline/PipelineManager";
export { Stage } from "./pipeline/Stage";
export { Step } from "./pipeline/Step";

// Utility Functions and Modules
// If there are reusable utilities, add them here.
// Example:
// export { someUtilityFunction } from "./utils";

// Action Registry
// Export functions related to action registration and retrieval.
// export {
//     registerAction,
//     getAction,
//     listRegisteredActions
// } from "../actions/ActionRegistry";

/**
 * Note: If new modules or files are added in the `core` directory,
 * consider using an automated script to dynamically export them here.
 * Tools like `barrel` can help maintain such an index file efficiently.
 */
