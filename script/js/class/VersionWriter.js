import { __awaiter, __generator } from "tslib";
import { promises as fs } from 'fs';
var VersionWriter = (function () {
    function VersionWriter() {
    }
    VersionWriter.prototype.writeVersionToFile = function (filePath, version) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, fs.writeFile(filePath, version, 'utf8')];
                    case 1:
                        _a.sent();
                        console.log("Version ".concat(version, " written to ").concat(filePath));
                        return [3, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error writing version to file: ".concat(error_1));
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    return VersionWriter;
}());
export default VersionWriter;
//# sourceMappingURL=VersionWriter.js.map