export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        // Type must be one of the following
        "type-enum": [
            2,
            "always",
            [
                "feat", // New feature
                "fix", // Bug fix
                "docs", // Documentation changes
                "style", // Code style changes (formatting, etc.)
                "refactor", // Code refactoring
                "perf", // Performance improvements
                "test", // Adding or updating tests
                "build", // Build system or dependencies
                "ci", // CI/CD changes
                "chore", // Maintenance tasks
                "revert", // Reverting changes
            ],
        ],
        // Subject must not be empty
        "subject-empty": [2, "never"],
        // Subject must be lowercase
        "subject-case": [2, "always", "lower-case"],
        // Type must not be empty
        "type-empty": [2, "never"],
        // Type must be lowercase
        "type-case": [2, "always", "lower-case"],
        // Header must not exceed 100 characters
        "header-max-length": [2, "always", 100],
    },
};
