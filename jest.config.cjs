module.exports = {
    roots: ["<rootDir>/tst"],
    testEnvironment: "node",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "js"],
    testRegex: ".*\\.test\\.ts$", // Match files ending with .test.ts
    verbose: true,
};
