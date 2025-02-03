import { __awaiter } from "tslib";
import { promises as fs } from "fs";
import path from "path";
class JSONLoader {
    loadJSON(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs.readFile(filePath, "utf8");
                return JSON.parse(data);
            }
            catch (error) {
                console.error(`Error reading JSON file: ${filePath}`, error);
                throw error;
            }
        });
    }
    loadJSONFromDirectory(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = yield fs.readdir(dirPath);
                const jsonFiles = files.filter((file) => file.endsWith(".json"));
                const jsonData = yield Promise.all(jsonFiles.map((file) => this.loadJSON(path.join(dirPath, file))));
                return jsonData;
            }
            catch (error) {
                console.error(`Error reading JSON files from directory: ${dirPath}`, error);
                throw error;
            }
        });
    }
    mergeJSONObjects(objects) {
        return __awaiter(this, void 0, void 0, function* () {
            return objects.reduce((acc, obj) => (Object.assign(Object.assign({}, acc), obj)), {});
        });
    }
}
export default JSONLoader;
//# sourceMappingURL=JSONLoader.js.map