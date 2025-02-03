import { __awaiter } from "tslib";
import { promises as fs } from "fs";
class SvgReader {
    readSVG(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs.readFile(filePath, "utf-8");
                return data;
            }
            catch (error) {
                console.error(`Error reading SVG file: ${filePath}`, error);
                throw error;
            }
        });
    }
}
export default SvgReader;
//# sourceMappingURL=SvgReader.js.map