// ============================================================================
// Imports
// ============================================================================

import js from "@eslint/js";
import stylelint from "stylelint-config-standard-scss";
import tseslint from "typescript-eslint";

// ============================================================================
// ESLint Configuration
// ============================================================================

export default [
    js.configs.recommended,
    tseslint.configs.recommended,

    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaVersion: "2021",
                // ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "warn",

            "import/order": [
                "error",
                { groups: ["builtin", "external", "internal"] },
            ],
            "import/no-unresolved": "error",

            "prettier/prettier": [
                "error",
                { singleQuote: true, trailingComma: "all" },
            ],

            "no-console": "warn",
            "no-debugger": "warn",
        },
    },

    // Enable Stylelint for SCSS files
    stylelint,
];
