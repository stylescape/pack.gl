// ============================================================================
// Import
// ============================================================================

// Main Function
export { Kist } from "./kist.js";

// Additional Types
export * from "./types/index.js";

// Note: the CLI entry point (`./cli.js`) is intentionally NOT re-exported
// here. Its module body starts the CLI, so importing the library must never
// pull it in. Use the `kist` bin or the `kist/cli` subpath to run the CLI.

// ============================================================================
// Plugin System Exports
// ============================================================================

// Core plugin interfaces and types
export { ActionInterface } from "./interface/ActionInterface.js";
export { ActionPlugin } from "./interface/ActionPlugin.js";
export { PluginMetadata } from "./interface/PluginMetadata.js";

// Plugin management
export { PluginManager } from "./core/plugin/PluginManager.js";

// Action system
export { Action } from "./core/pipeline/Action.js";
export { ActionRegistry } from "./core/pipeline/ActionRegistry.js";

// Configuration for plugin developers
export {
    CORE_ACTIONS,
    MIGRATED_ACTIONS,
    MIGRATED_PACKAGES,
    type CoreActionName,
    type MigratedActionName,
} from "./config/actions.config.js";

// ============================================================================
// Error Classes
// ============================================================================

export {
    // Base error
    KistError,
    // Config errors
    ConfigError,
    ConfigNotFoundError,
    ConfigParseError,
    ConfigValidationError,
    // Build errors
    BuildError,
    ActionError,
    StepError,
    StageError,
    // Plugin errors
    PluginError,
    PluginNotFoundError,
    PluginInitError,
    // File system errors
    FileSystemError,
    FileNotFoundError,
    DirectoryNotFoundError,
    PermissionError,
    PathTraversalError,
    // CLI errors
    CLIError,
    InvalidArgumentError,
    MissingArgumentError,
    // Resource errors
    TimeoutError,
    ResourceLimitError,
    // Error codes
    ErrorCodes,
    type ErrorCode,
} from "./errors/index.js";
