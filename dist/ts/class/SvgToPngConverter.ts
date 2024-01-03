// class/SvgToPngConverter.ts

// Copyright 2023 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// ============================================================================
// Import
// ============================================================================

import sharp from 'sharp';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';


// ============================================================================
// Classes
// ============================================================================

class SvgToPngConverter {
    async convert(svgContent: string, outputPath: string, width?: number, height?: number): Promise<void> {
        try {

            // Ensure the output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Create a JSDOM instance to parse the SVG
            const dom = new JSDOM(svgContent);
            const svgElement = dom.window.document.querySelector('svg');

            if (!svgElement) {
                throw new Error('Invalid SVG content');
            }

            if (width) {
                svgElement.setAttribute('width', width.toString());
            }

            if (height) {
                svgElement.setAttribute('height', height.toString());
            }

            const updatedSvgContent = svgElement.outerHTML;
            const pngBuffer = await sharp(Buffer.from(updatedSvgContent)).png().toBuffer();

            await sharp(pngBuffer).toFile(outputPath);
        } catch (error) {
            console.error(`Error converting SVG to PNG: ${error}`);
            throw error;
        }
    }
}


// ============================================================================
// Export
// ============================================================================

export default SvgToPngConverter;
