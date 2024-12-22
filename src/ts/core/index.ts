// ============================================================================
// Core Module Exports
// ============================================================================

/**
 * Export core classes and modules for use in the application.
 * Ensure all essential components are listed here to provide a unified API.
 */

// Core Classes
export { Pipeline } from "./Pipeline";
export { Stage } from "./Stage";
export { Step } from "./Step";
export { Action } from "./Action";
export { PipelineManager } from "./PipelineManager";

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
