import { __awaiter } from "tslib";
import { createCanvas } from "canvas";
import { Canvg } from "canvg";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
function getSafeRenderingContext(canvas) {
    return canvas.getContext("2d");
}
class SvgToPngConverter {
    convert(svgContent, outputPath, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dom = new JSDOM(svgContent);
                const svgElement = dom.window.document.querySelector("svg");
                if (!svgElement) {
                    throw new Error("Invalid SVG content");
                }
                const w = width ||
                    parseInt(svgElement.getAttribute("width") || "800", 10);
                const h = height ||
                    parseInt(svgElement.getAttribute("height") || "600", 10);
                svgElement.setAttribute("width", w.toString());
                svgElement.setAttribute("height", h.toString());
                const updatedSvg = svgElement.outerHTML;
                const canvas = createCanvas(w, h);
                const ctx = getSafeRenderingContext(canvas);
                const canvg = yield Canvg.from(ctx, updatedSvg);
                yield canvg.render();
                const outputDir = path.dirname(outputPath);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                const buffer = canvas.toBuffer("image/png");
                fs.writeFileSync(outputPath, buffer);
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