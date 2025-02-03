import { __awaiter } from "tslib";
import { promises as fs } from "fs";
import path from "path";
function readPackageJson(packageJsonPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullPath = path.resolve(packageJsonPath);
        try {
            const fileContent = yield fs.readFile(fullPath, "utf-8");
            return JSON.parse(fileContent);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                throw new Error(`File not found at ${fullPath}. Please ensure the path is correct.`);
            }
            else if (error.name === "SyntaxError") {
                throw new Error(`Failed to parse JSON from ${fullPath}: ${error.message}`);
            }
            else {
                throw new Error(`An unexpected error occurred while reading ${fullPath}: ${error.message}`);
            }
        }
    });
}
export default readPackageJson;
//# sourceMappingURL=readPackageJson.js.map