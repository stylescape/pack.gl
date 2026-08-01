// ============================================================================
// Error Classes Tests
// ============================================================================

import {
    KistError,
    ConfigError,
    ConfigNotFoundError,
    ConfigParseError,
    ConfigValidationError,
    BuildError,
    ActionError,
    StepError,
    StageError,
    PluginError,
    PluginNotFoundError,
    PluginInitError,
    FileSystemError,
    FileNotFoundError,
    DirectoryNotFoundError,
    PermissionError,
    PathTraversalError,
    CLIError,
    InvalidArgumentError,
    MissingArgumentError,
    TimeoutError,
    ResourceLimitError,
    ErrorCodes,
} from "../src/ts/errors/index";

describe("KistError", () => {
    it("should create error with message and code", () => {
        const error = new KistError("Test error", "TEST_CODE");
        expect(error.message).toBe("Test error");
        expect(error.code).toBe("TEST_CODE");
        expect(error.name).toBe("KistError");
    });

    it("should include context", () => {
        const error = new KistError("Test", "CODE", { key: "value" });
        expect(error.context).toEqual({ key: "value" });
    });

    it("should include cause", () => {
        const cause = new Error("Original error");
        const error = new KistError("Test", "CODE", undefined, cause);
        expect(error.cause).toBe(cause);
    });

    it("should serialize to JSON", () => {
        const error = new KistError("Test", "CODE", { key: "value" });
        const json = error.toJSON();
        expect(json.name).toBe("KistError");
        expect(json.message).toBe("Test");
        expect(json.code).toBe("CODE");
        expect(json.context).toEqual({ key: "value" });
    });
});

describe("ConfigError", () => {
    it("should create ConfigError", () => {
        const error = new ConfigError("Invalid config");
        expect(error.name).toBe("ConfigError");
        expect(error.code).toBe("CONFIG_ERROR");
    });
});

describe("ConfigNotFoundError", () => {
    it("should include config path in message", () => {
        const error = new ConfigNotFoundError("/path/to/config.yml");
        expect(error.message).toContain("/path/to/config.yml");
        expect(error.context?.configPath).toBe("/path/to/config.yml");
    });
});

describe("ConfigParseError", () => {
    it("should include parse error details", () => {
        const error = new ConfigParseError(
            "config.yml",
            "Invalid YAML syntax",
        );
        expect(error.message).toContain("Invalid YAML syntax");
        expect(error.context?.configPath).toBe("config.yml");
    });
});

describe("ConfigValidationError", () => {
    it("should include all validation errors", () => {
        const errors = ["Missing field: name", "Invalid type: version"];
        const error = new ConfigValidationError(errors);
        expect(error.validationErrors).toEqual(errors);
        expect(error.message).toContain("Missing field: name");
        expect(error.message).toContain("Invalid type: version");
    });
});

describe("ActionError", () => {
    it("should include action name", () => {
        const error = new ActionError(
            "TypeScriptCompiler",
            "Compilation failed",
        );
        expect(error.message).toContain("TypeScriptCompiler");
        expect(error.context?.actionName).toBe("TypeScriptCompiler");
    });
});

describe("StepError", () => {
    it("should include step and stage names", () => {
        const error = new StepError("compile", "build", "Failed to compile");
        expect(error.message).toContain("compile");
        expect(error.message).toContain("build");
        expect(error.context?.stepName).toBe("compile");
        expect(error.context?.stageName).toBe("build");
    });
});

describe("PluginNotFoundError", () => {
    it("should include plugin name", () => {
        const error = new PluginNotFoundError("kist-action-sass");
        expect(error.message).toContain("kist-action-sass");
        expect(error.context?.pluginName).toBe("kist-action-sass");
    });
});

describe("FileNotFoundError", () => {
    it("should include file path", () => {
        const error = new FileNotFoundError("/path/to/file.txt");
        expect(error.message).toContain("/path/to/file.txt");
        expect(error.context?.filePath).toBe("/path/to/file.txt");
    });
});

describe("PathTraversalError", () => {
    it("should detect path traversal", () => {
        const error = new PathTraversalError("../../../etc/passwd", "/app");
        expect(error.message).toContain("Path traversal");
        expect(error.context?.path).toBe("../../../etc/passwd");
        expect(error.context?.basePath).toBe("/app");
    });
});

describe("InvalidArgumentError", () => {
    it("should include argument and reason", () => {
        const error = new InvalidArgumentError(
            "--config",
            "File does not exist",
        );
        expect(error.message).toContain("--config");
        expect(error.message).toContain("File does not exist");
    });
});

describe("TimeoutError", () => {
    it("should include operation and timeout", () => {
        const error = new TimeoutError("file copy", 5000);
        expect(error.message).toContain("file copy");
        expect(error.message).toContain("5000ms");
        expect(error.context?.timeoutMs).toBe(5000);
    });
});

describe("ResourceLimitError", () => {
    it("should include resource details", () => {
        const error = new ResourceLimitError("file size", 10, 25, "MB");
        expect(error.message).toContain("10MB");
        expect(error.message).toContain("25MB");
        expect(error.context?.resource).toBe("file size");
    });
});

describe("StageError", () => {
    it("should include stage name and message", () => {
        const cause = new Error("underlying");
        const error = new StageError("build", "Something broke", cause);
        expect(error.name).toBe("StageError");
        expect(error.code).toBe("BUILD_ERROR");
        expect(error.message).toBe('Stage "build" failed: Something broke');
        expect(error.context?.stageName).toBe("build");
        expect(error.cause).toBe(cause);
    });
});

describe("BuildError", () => {
    it("should create BuildError with defaults", () => {
        const error = new BuildError("boom");
        expect(error.name).toBe("BuildError");
        expect(error.code).toBe("BUILD_ERROR");
        expect(error.context).toBeUndefined();
        expect(error.cause).toBeUndefined();
    });
});

describe("PluginError", () => {
    it("should create PluginError", () => {
        const error = new PluginError("plugin blew up", { pluginName: "x" });
        expect(error.name).toBe("PluginError");
        expect(error.code).toBe("PLUGIN_ERROR");
        expect(error.context?.pluginName).toBe("x");
    });
});

describe("PluginInitError", () => {
    it("should include plugin name and message", () => {
        const cause = new Error("no default export");
        const error = new PluginInitError(
            "kist-action-sass",
            "bad export",
            cause,
        );
        expect(error.name).toBe("PluginInitError");
        expect(error.message).toBe(
            'Failed to initialize plugin "kist-action-sass": bad export',
        );
        expect(error.context?.pluginName).toBe("kist-action-sass");
        expect(error.cause).toBe(cause);
    });
});

describe("FileSystemError", () => {
    it("should create FileSystemError", () => {
        const error = new FileSystemError("disk on fire");
        expect(error.name).toBe("FileSystemError");
        expect(error.code).toBe("FS_ERROR");
    });
});

describe("DirectoryNotFoundError", () => {
    it("should include directory path", () => {
        const cause = new Error("ENOENT");
        const error = new DirectoryNotFoundError("/tmp/missing", cause);
        expect(error.name).toBe("DirectoryNotFoundError");
        expect(error.message).toBe("Directory not found: /tmp/missing");
        expect(error.context?.dirPath).toBe("/tmp/missing");
        expect(error.cause).toBe(cause);
    });
});

describe("PermissionError", () => {
    it("should include path and operation", () => {
        const cause = new Error("EACCES");
        const error = new PermissionError("/etc/hosts", "write", cause);
        expect(error.name).toBe("PermissionError");
        expect(error.message).toBe(
            'Permission denied: cannot write "/etc/hosts"',
        );
        expect(error.context?.path).toBe("/etc/hosts");
        expect(error.context?.operation).toBe("write");
        expect(error.cause).toBe(cause);
    });
});

describe("CLIError", () => {
    it("should create CLIError", () => {
        const error = new CLIError("bad cli", { argv: [] });
        expect(error.name).toBe("CLIError");
        expect(error.code).toBe("CLI_ERROR");
        expect(error.context?.argv).toEqual([]);
    });
});

describe("MissingArgumentError", () => {
    it("should include the missing argument", () => {
        const error = new MissingArgumentError("--config");
        expect(error.name).toBe("MissingArgumentError");
        expect(error.message).toBe("Missing required argument: --config");
        expect(error.context?.argument).toBe("--config");
    });
});

describe("ResourceLimitError", () => {
    it("should default the unit to an empty string", () => {
        const error = new ResourceLimitError("open files", 100, 250);
        expect(error.message).toBe(
            "Resource limit exceeded: open files (limit: 100, actual: 250)",
        );
        expect(error.context?.unit).toBe("");
        expect(error.code).toBe("RESOURCE_LIMIT_ERROR");
    });
});

describe("KistError.toJSON", () => {
    it("should include the cause message when a cause is present", () => {
        const error = new KistError(
            "Test",
            "CODE",
            undefined,
            new Error("root"),
        );
        expect(error.toJSON().cause).toBe("root");
    });

    it("should leave the cause undefined when no cause is present", () => {
        const error = new KistError("Test", "CODE");
        expect(error.toJSON().cause).toBeUndefined();
    });
});

describe("KistError stack capture", () => {
    it("should still construct when Error.captureStackTrace is unavailable", () => {
        const original = Error.captureStackTrace;
        // Simulate a runtime without V8's captureStackTrace (e.g. some browsers).
        (Error as { captureStackTrace?: unknown }).captureStackTrace =
            undefined;
        try {
            const error = new KistError("no capture", "CODE");
            expect(error.message).toBe("no capture");
            expect(error.code).toBe("CODE");
        } finally {
            Error.captureStackTrace = original;
        }
    });
});

describe("ErrorCodes", () => {
    it("should have all error codes defined", () => {
        expect(ErrorCodes.CONFIG_ERROR).toBe("CONFIG_ERROR");
        expect(ErrorCodes.BUILD_ERROR).toBe("BUILD_ERROR");
        expect(ErrorCodes.PLUGIN_ERROR).toBe("PLUGIN_ERROR");
        expect(ErrorCodes.FS_ERROR).toBe("FS_ERROR");
        expect(ErrorCodes.CLI_ERROR).toBe("CLI_ERROR");
        expect(ErrorCodes.TIMEOUT_ERROR).toBe("TIMEOUT_ERROR");
    });

    it("should expose every documented code", () => {
        expect(ErrorCodes).toEqual({
            CONFIG_ERROR: "CONFIG_ERROR",
            CONFIG_NOT_FOUND: "CONFIG_NOT_FOUND",
            CONFIG_PARSE_ERROR: "CONFIG_PARSE_ERROR",
            CONFIG_VALIDATION_ERROR: "CONFIG_VALIDATION_ERROR",
            BUILD_ERROR: "BUILD_ERROR",
            ACTION_ERROR: "ACTION_ERROR",
            STEP_ERROR: "STEP_ERROR",
            STAGE_ERROR: "STAGE_ERROR",
            PLUGIN_ERROR: "PLUGIN_ERROR",
            PLUGIN_NOT_FOUND: "PLUGIN_NOT_FOUND",
            PLUGIN_INIT_ERROR: "PLUGIN_INIT_ERROR",
            FS_ERROR: "FS_ERROR",
            FILE_NOT_FOUND: "FILE_NOT_FOUND",
            DIR_NOT_FOUND: "DIR_NOT_FOUND",
            PERMISSION_ERROR: "PERMISSION_ERROR",
            PATH_TRAVERSAL: "PATH_TRAVERSAL",
            CLI_ERROR: "CLI_ERROR",
            INVALID_ARGUMENT: "INVALID_ARGUMENT",
            MISSING_ARGUMENT: "MISSING_ARGUMENT",
            TIMEOUT_ERROR: "TIMEOUT_ERROR",
            RESOURCE_LIMIT_ERROR: "RESOURCE_LIMIT_ERROR",
        });
    });
});
