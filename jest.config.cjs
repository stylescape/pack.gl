module.exports = {
    roots: ["<rootDir>/src/tests"],
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "js"],
    testRegex: ".*\\.test\\.ts$", // Match files ending with .test.ts
    verbose: true,
};