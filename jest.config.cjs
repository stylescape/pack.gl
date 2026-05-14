module.exports = {
    roots: ["<rootDir>/tst"],
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json", isolatedModules: true }],
    },
    moduleFileExtensions: ["ts", "js"],
    testRegex: ".*\\.test\\.ts$", // Match files ending with .test.ts
    verbose: true,    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/**/*.test.ts"
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }};
