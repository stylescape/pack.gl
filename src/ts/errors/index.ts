// ============================================================================
// Kist Base Error
// ============================================================================

/**
 * Base error class for all Kist errors.
 * Provides a consistent structure for error handling.
 */
export class KistError extends Error {
    /** Error code for programmatic handling */
    public readonly code: string;
    /** Additional context for the error */
    public readonly context?: Record<string, unknown>;
    /** Original error that caused this error */
    public readonly cause?: Error;

    constructor(
        message: string,
        code: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(message);
        this.name = "KistError";
        this.code = code;
        this.context = context;
        this.cause = cause;

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Returns a JSON-serializable representation of the error
     */
    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            stack: this.stack,
            cause: this.cause?.message,
        };
    }
}

// ============================================================================
// Configuration Errors
// ============================================================================

/**
 * Error thrown when configuration is invalid or missing
 */
export class ConfigError extends KistError {
    constructor(
        message: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(message, "CONFIG_ERROR", context, cause);
        this.name = "ConfigError";
    }
}

/**
 * Error thrown when a config file cannot be found
 */
export class ConfigNotFoundError extends ConfigError {
    constructor(configPath: string, cause?: Error) {
        super(
            `Configuration file not found: ${configPath}`,
            { configPath },
            cause,
        );
        this.name = "ConfigNotFoundError";
    }
}

/**
 * Error thrown when config parsing fails
 */
export class ConfigParseError extends ConfigError {
    constructor(configPath: string, parseError: string, cause?: Error) {
        super(
            `Failed to parse configuration: ${parseError}`,
            { configPath, parseError },
            cause,
        );
        this.name = "ConfigParseError";
    }
}

/**
 * Error thrown when config validation fails
 */
export class ConfigValidationError extends ConfigError {
    public readonly validationErrors: string[];

    constructor(
        validationErrors: string[],
        configPath?: string,
        cause?: Error,
    ) {
        super(
            `Configuration validation failed:\n  - ${validationErrors.join("\n  - ")}`,
            { configPath, validationErrors },
            cause,
        );
        this.name = "ConfigValidationError";
        this.validationErrors = validationErrors;
    }
}

// ============================================================================
// Build Errors
// ============================================================================

/**
 * Error thrown during build/pipeline execution
 */
export class BuildError extends KistError {
    constructor(
        message: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(message, "BUILD_ERROR", context, cause);
        this.name = "BuildError";
    }
}

/**
 * Error thrown when an action fails
 */
export class ActionError extends BuildError {
    constructor(
        actionName: string,
        message: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(
            `Action "${actionName}" failed: ${message}`,
            { actionName, ...context },
            cause,
        );
        this.name = "ActionError";
    }
}

/**
 * Error thrown when a step in the pipeline fails
 */
export class StepError extends BuildError {
    constructor(
        stepName: string,
        stageName: string,
        message: string,
        cause?: Error,
    ) {
        super(
            `Step "${stepName}" in stage "${stageName}" failed: ${message}`,
            { stepName, stageName },
            cause,
        );
        this.name = "StepError";
    }
}

/**
 * Error thrown when a stage fails
 */
export class StageError extends BuildError {
    constructor(stageName: string, message: string, cause?: Error) {
        super(`Stage "${stageName}" failed: ${message}`, { stageName }, cause);
        this.name = "StageError";
    }
}

// ============================================================================
// Plugin Errors
// ============================================================================

/**
 * Error thrown when plugin loading or initialization fails
 */
export class PluginError extends KistError {
    constructor(
        message: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(message, "PLUGIN_ERROR", context, cause);
        this.name = "PluginError";
    }
}

/**
 * Error thrown when a plugin cannot be found
 */
export class PluginNotFoundError extends PluginError {
    constructor(pluginName: string, cause?: Error) {
        super(`Plugin not found: ${pluginName}`, { pluginName }, cause);
        this.name = "PluginNotFoundError";
    }
}

/**
 * Error thrown when plugin initialization fails
 */
export class PluginInitError extends PluginError {
    constructor(pluginName: string, message: string, cause?: Error) {
        super(
            `Failed to initialize plugin "${pluginName}": ${message}`,
            { pluginName },
            cause,
        );
        this.name = "PluginInitError";
    }
}

// ============================================================================
// File System Errors
// ============================================================================

/**
 * Error thrown for file system operations
 */
export class FileSystemError extends KistError {
    constructor(
        message: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(message, "FS_ERROR", context, cause);
        this.name = "FileSystemError";
    }
}

/**
 * Error thrown when a file is not found
 */
export class FileNotFoundError extends FileSystemError {
    constructor(filePath: string, cause?: Error) {
        super(`File not found: ${filePath}`, { filePath }, cause);
        this.name = "FileNotFoundError";
    }
}

/**
 * Error thrown when a directory is not found
 */
export class DirectoryNotFoundError extends FileSystemError {
    constructor(dirPath: string, cause?: Error) {
        super(`Directory not found: ${dirPath}`, { dirPath }, cause);
        this.name = "DirectoryNotFoundError";
    }
}

/**
 * Error thrown for file permission issues
 */
export class PermissionError extends FileSystemError {
    constructor(path: string, operation: string, cause?: Error) {
        super(
            `Permission denied: cannot ${operation} "${path}"`,
            { path, operation },
            cause,
        );
        this.name = "PermissionError";
    }
}

/**
 * Error thrown for potential path traversal attacks
 */
export class PathTraversalError extends FileSystemError {
    constructor(path: string, basePath: string) {
        super(
            `Path traversal detected: "${path}" escapes base path "${basePath}"`,
            { path, basePath },
        );
        this.name = "PathTraversalError";
    }
}

// ============================================================================
// CLI Errors
// ============================================================================

/**
 * Error thrown for CLI-related issues
 */
export class CLIError extends KistError {
    constructor(
        message: string,
        context?: Record<string, unknown>,
        cause?: Error,
    ) {
        super(message, "CLI_ERROR", context, cause);
        this.name = "CLIError";
    }
}

/**
 * Error thrown for invalid CLI arguments
 */
export class InvalidArgumentError extends CLIError {
    constructor(argument: string, reason: string) {
        super(`Invalid argument "${argument}": ${reason}`, {
            argument,
            reason,
        });
        this.name = "InvalidArgumentError";
    }
}

/**
 * Error thrown when a required argument is missing
 */
export class MissingArgumentError extends CLIError {
    constructor(argument: string) {
        super(`Missing required argument: ${argument}`, { argument });
        this.name = "MissingArgumentError";
    }
}

// ============================================================================
// Timeout/Resource Errors
// ============================================================================

/**
 * Error thrown when an operation times out
 */
export class TimeoutError extends KistError {
    constructor(operation: string, timeoutMs: number, cause?: Error) {
        super(
            `Operation "${operation}" timed out after ${timeoutMs}ms`,
            "TIMEOUT_ERROR",
            { operation, timeoutMs },
            cause,
        );
        this.name = "TimeoutError";
    }
}

/**
 * Error thrown when resource limits are exceeded
 */
export class ResourceLimitError extends KistError {
    constructor(
        resource: string,
        limit: number,
        actual: number,
        unit: string = "",
    ) {
        super(
            `Resource limit exceeded: ${resource} (limit: ${limit}${unit}, actual: ${actual}${unit})`,
            "RESOURCE_LIMIT_ERROR",
            { resource, limit, actual, unit },
        );
        this.name = "ResourceLimitError";
    }
}

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Machine-readable codes for every error class in this module, exposed as a
 * single lookup table so callers can compare `error.code` against a known
 * constant instead of a string literal.
 */
export const ErrorCodes = {
    // Config errors
    CONFIG_ERROR: "CONFIG_ERROR",
    CONFIG_NOT_FOUND: "CONFIG_NOT_FOUND",
    CONFIG_PARSE_ERROR: "CONFIG_PARSE_ERROR",
    CONFIG_VALIDATION_ERROR: "CONFIG_VALIDATION_ERROR",

    // Build errors
    BUILD_ERROR: "BUILD_ERROR",
    ACTION_ERROR: "ACTION_ERROR",
    STEP_ERROR: "STEP_ERROR",
    STAGE_ERROR: "STAGE_ERROR",

    // Plugin errors
    PLUGIN_ERROR: "PLUGIN_ERROR",
    PLUGIN_NOT_FOUND: "PLUGIN_NOT_FOUND",
    PLUGIN_INIT_ERROR: "PLUGIN_INIT_ERROR",

    // File system errors
    FS_ERROR: "FS_ERROR",
    FILE_NOT_FOUND: "FILE_NOT_FOUND",
    DIR_NOT_FOUND: "DIR_NOT_FOUND",
    PERMISSION_ERROR: "PERMISSION_ERROR",
    PATH_TRAVERSAL: "PATH_TRAVERSAL",

    // CLI errors
    CLI_ERROR: "CLI_ERROR",
    INVALID_ARGUMENT: "INVALID_ARGUMENT",
    MISSING_ARGUMENT: "MISSING_ARGUMENT",

    // Resource errors
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    RESOURCE_LIMIT_ERROR: "RESOURCE_LIMIT_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
