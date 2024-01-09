"use strict";
// config/fantasticon.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
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
var fantasticon_1 = require("fantasticon");
const fantasticonConfig = {
    // RunnerOptionalOptions
    name: 'icon',
    fontTypes: [
        fantasticon_1.FontAssetType.TTF, // TTF = "ttf"
        fantasticon_1.FontAssetType.WOFF, // WOFF = "woff"
        fantasticon_1.FontAssetType.WOFF2, // WOFF2 = "woff2"
        fantasticon_1.FontAssetType.EOT, // EOT = "eot"
        fantasticon_1.FontAssetType.SVG, // SVG = "svg"
    ],
    assetTypes: [
        fantasticon_1.OtherAssetType.CSS, // CSS = "css",
        fantasticon_1.OtherAssetType.SCSS, // SCSS = "scss",
        fantasticon_1.OtherAssetType.SASS, // SASS = "sass",
        fantasticon_1.OtherAssetType.HTML, // HTML = "html",
        fantasticon_1.OtherAssetType.JSON, // JSON = "json",
        fantasticon_1.OtherAssetType.TS, // TS = "ts"    
    ],
    formatOptions: {
        // woff: {
        // //   // Woff Extended Metadata Block - see https://www.w3.org/TR/WOFF/#Metadata
        // //   metadata: '...'
        // // },
        // // ttf?: TtfOptions; // type TtfOptions = svg2ttf.FontOptions;
        // // svg?: SvgOptions;  // type SvgOptions = Omit<SvgIcons2FontOptions, 'fontName' | 'fontHeight' | 'descent' | 'normalize'>;
        json: { indent: 4 },
        ts: {
            // select what kind of types you want to generate
            // (default `['enum', 'constant', 'literalId', 'literalKey']`)
            // render the types with `'` instead of `"` (default is `"`)
            singleQuotes: false,
            enumName: 'icon_gl',
            // customise names used for the generated types and constants
            constantName: 'MY_CODEPOINTS'
            // literalIdName: 'IconId',
        }
    },
    pathOptions: {
        json: './dist/font/icon.gl.json',
        css: './dist/font/icon.gl.css',
        scss: './dist/font/icon.gl.scss',
        woff: './dist/font/icon.gl.woff',
        woff2: './dist/font/icon.gl.woff2'
    },
    codepoints: {
        'chevron-left': 57344, // decimal representation of 0xe000
        'chevron-right': 57345,
        'thumbs-up': 57358,
        'thumbs-down': 57359
    },
    // fontHeight: number;
    // descent: number;
    // normalize: boolean;
    // round: number;
    selector: '.i',
    // tag: string;
    // Use our custom Handlebars templates
    // templates: {
    //     css: './build/font/icon.gl.css.hbs',
    //     scss: './build/font/icon.gl.scss.hbs'
    // }, 
    prefix: 'icon',
    fontsUrl: './fonts'
};
exports.default = fantasticonConfig;
// export const fontConfig = {
//     // RunnerMandatoryOptions
//     inputDir: sourceDirectory, // (required)
//     outputDir: outputDiectory, // (required)
//     // RunnerOptionalOptions
//     name: 'icon.gl',
//     fontTypes: [
//         FontAssetType.TTF,      // TTF = "ttf"
//         FontAssetType.WOFF,     // WOFF = "woff"
//         FontAssetType.WOFF2,    // WOFF2 = "woff2"
//         FontAssetType.EOT,      // EOT = "eot"
//         FontAssetType.SVG,      // SVG = "svg"
//     ],
//     assetTypes: [
//         OtherAssetType.CSS,     // CSS = "css",
//         OtherAssetType.SCSS,    // SCSS = "scss",
//         OtherAssetType.SASS,    // SASS = "sass",
//         OtherAssetType.HTML,    // HTML = "html",
//         OtherAssetType.JSON,    // JSON = "json",
//         OtherAssetType.TS,      // TS = "ts"    
//     ],
//     formatOptions: {
//     // woff: {
//     //   // Woff Extended Metadata Block - see https://www.w3.org/TR/WOFF/#Metadata
//     //   metadata: '...'
//     // },
//     // ttf?: TtfOptions; // type TtfOptions = svg2ttf.FontOptions;
//     // svg?: SvgOptions;  // type SvgOptions = Omit<SvgIcons2FontOptions, 'fontName' | 'fontHeight' | 'descent' | 'normalize'>;
//     json: { indent: 4 } ,
//     // ts: {
//     //     // select what kind of types you want to generate
//     //     // (default `['enum', 'constant', 'literalId', 'literalKey']`)
//     //     types: ['enum', 'constant', 'literalId', 'literalKey'],
//     //     // render the types with `'` instead of `"` (default is `"`)
//     //     singleQuotes: false,
//     //     // customise names used for the generated types and constants
//     //     enumName: 'icon_gl',
//     //     constantName: 'MY_CODEPOINTS'
//     //     // literalIdName: 'IconId',
//     //     // literalKeyName: 'IconKey'
//     // }
//     },
// pathOptions: {
//     json:   './dist/font/icon.gl.json',
//     css:    './dist/font/icon.gl.css',
//     scss:   './dist/font/icon.gl.scss',
//     woff:   './dist/font/icon.gl.woff',
//     woff2:  './dist/font/icon.gl.woff2',
// },
// // codepoints: {
// //     'chevron-left':     57344, // decimal representation of 0xe000
// //     'chevron-right':    57345,
// //     'thumbs-up':        57358,
// //     'thumbs-down':      57359,
// // },
// // fontHeight: number;
// // descent: number;
// // normalize: boolean;
// // round: number;
// selector: '.igl',
// // tag: string;
// // Use our custom Handlebars templates
// // templates: {
// //     css: './build/font/icon.gl.css.hbs',
// //     scss: './build/font/icon.gl.scss.hbs'
// // }, 
// prefix: 'igl',
// fontsUrl: './fonts',
// // Customize generated icon IDs (unavailable with `.json` config file)
// // getIconId: ({
// //     basename, // `string` - Example: 'foo';
// //     relativeDirPath, // `string` - Example: 'sub/dir/foo.svg'
// //     absoluteFilePath, // `string` - Example: '/var/icons/sub/dir/foo.svg'
// //     relativeFilePath, // `string` - Example: 'foo.svg'
// //     index // `number` - Example: `0`
// // }) => [index, basename].join('_') // '0_foo'
// };
