// ============================================================================
// Imports
// ============================================================================

import js from "@eslint/js";
import tseslint from "typescript-eslint";

// ============================================================================
// ESLint Configuration
// ============================================================================

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        ignores: [
            "**/*.min.js",
            "**/dist/**",
            "**/vendor/**",
            ".cache/**",
            "node_modules/**",
            "coverage/**",
            "bin/**",
            "public/**",
            "tmp/**",
            "**/tests/**",
        ],
    },

    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaVersion: 2021,
                sourceType: "module",
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/consistent-type-imports": "warn",
            "no-console": "warn",
            "no-debugger": "warn",
        },
    },

    // CommonJS configuration files (e.g. jest.config.cjs)
    {
        files: ["**/*.cjs"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                module: "writable",
                require: "readonly",
                process: "readonly",
                __dirname: "readonly",
            },
        },
    },

    // Browser-side scripts served to live reload clients
    {
        files: ["src/ts/live/*.js"],
        languageOptions: {
            globals: {
                WebSocket: "readonly",
                console: "readonly",
                window: "readonly",
                document: "readonly",
                location: "readonly",
            },
        },
    },

    // Tests intentionally use require() with jest.isolateModules to reload
    // modules with fresh state.
    {
        files: ["tst/**/*.ts"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
