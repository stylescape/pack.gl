import { __awaiter } from "tslib";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
class SvgToPngConverter {
    convert(svgContent, outputPath, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const outputDir = path.dirname(outputPath);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                const dom = new JSDOM(svgContent);
                const svgElement = dom.window.document.querySelector("svg");
                if (!svgElement) {
                    throw new Error("Invalid SVG content");
                }
                if (width)
                    svgElement.setAttribute("width", width.toString());
                if (height)
                    svgElement.setAttribute("height", height.toString());
                const updatedSvgContent = svgElement.outerHTML;
                const resvg = new Resvg(updatedSvgContent);
                const pngBuffer = resvg.render().asPng();
                fs.writeFileSync(outputPath, pngBuffer);
                console.log(`PNG file has been saved to ${outputPath}`);
            }
            catch (error) {
                console.error(`Error converting SVG to PNG: ${error}`);
                throw error;
            }
        });
    }
}
export default SvgToPngConverter;
//# sourceMappingURL=SvgToPngConverter.js.map