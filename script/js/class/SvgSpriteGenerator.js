import { __awaiter, __generator } from "tslib";
import svgSprite from 'svg-sprite';
import fs from 'fs';
import path from 'path';
var SvgSpriteGenerator = (function () {
    function SvgSpriteGenerator(config) {
        this.config = config;
    }
    SvgSpriteGenerator.prototype.generateSprite = function (sourceDir, outputDir) {
        return __awaiter(this, void 0, void 0, function () {
            var files, sprite_1;
            return __generator(this, function (_a) {
                try {
                    files = fs.readdirSync(sourceDir);
                    sprite_1 = new svgSprite(this.config);
                    files.forEach(function (file) {
                        if (path.extname(file) === '.svg') {
                            var svgPath = path.resolve(sourceDir, file);
                            var content = fs.readFileSync(svgPath, 'utf8');
                            sprite_1.add(svgPath, null, content);
                        }
                    });
                    sprite_1.compile(function (error, result) {
                        if (error) {
                            throw error;
                        }
                        for (var mode in result) {
                            for (var resource in result[mode]) {
                                var outputPath = path.resolve(outputDir, result[mode][resource].path);
                                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                                fs.writeFileSync(outputPath, result[mode][resource].contents);
                            }
                        }
                    });
                }
                catch (err) {
                    console.error('Error generating SVG sprite:', err);
                }
                return [2];
            });
        });
    };
    return SvgSpriteGenerator;
}());
export default SvgSpriteGenerator;
//# sourceMappingURL=SvgSpriteGenerator.js.map