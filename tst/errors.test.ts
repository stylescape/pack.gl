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
        const error = new ConfigParseError("config.yml", "Invalid YAML syntax");
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
        const error = new ActionError("TypeScriptCompiler", "Compilation failed");
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
        const error = new InvalidArgumentError("--config", "File does not exist");
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

describe("ErrorCodes", () => {
    it("should have all error codes defined", () => {
        expect(ErrorCodes.CONFIG_ERROR).toBe("CONFIG_ERROR");
        expect(ErrorCodes.BUILD_ERROR).toBe("BUILD_ERROR");
        expect(ErrorCodes.PLUGIN_ERROR).toBe("PLUGIN_ERROR");
        expect(ErrorCodes.FS_ERROR).toBe("FS_ERROR");
        expect(ErrorCodes.CLI_ERROR).toBe("CLI_ERROR");
        expect(ErrorCodes.TIMEOUT_ERROR).toBe("TIMEOUT_ERROR");
    });
});
