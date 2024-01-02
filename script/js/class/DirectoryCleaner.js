import fs from 'fs';
import path from 'path';
var DirectoryCleaner = (function () {
    function DirectoryCleaner() {
    }
    DirectoryCleaner.prototype.cleanDirectory = function (dirPath) {
        var _this = this;
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(function (file) {
                var curPath = path.join(dirPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    _this.cleanDirectory(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dirPath);
        }
    };
    return DirectoryCleaner;
}());
export default DirectoryCleaner;
//# sourceMappingURL=DirectoryCleaner.js.map