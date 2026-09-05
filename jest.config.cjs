module.exports = {
    // `src` must be listed here so that `collectCoverageFrom` can discover
    // source files that are not reached by any test. With only `tst` in roots
    // Jest's crawler never sees them, and coverage is reported as if the
    // untouched files did not exist.
    roots: ["<rootDir>/tst", "<rootDir>/src"],
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
    },
    moduleFileExtensions: ["ts", "js"],
    // Source is authored as ESM and imports siblings with an explicit `.js`
    // extension. Under ts-jest those specifiers must resolve back to `.ts`.
    moduleNameMapper: {
        // chokidar v5 is ESM-only and cannot be `require`d by the CommonJS
        // test runtime. kist itself is ESM, so this affects tests only.
        "^chokidar$": "<rootDir>/tst/stubs/chokidar.ts",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    testRegex: ".*\\.test\\.ts$", // Match files ending with .test.ts
    verbose: true,
    coverageDirectory: "coverage",
    // `lcov` is the format Codecov ingests; the rest are for reading locally.
    coverageReporters: ["text", "lcov", "json", "html", "text-summary"],
    collectCoverageFrom: [
        "src/ts/**/*.ts",
        "!src/ts/**/*.d.ts",
        "!src/ts/**/*.test.ts",
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
