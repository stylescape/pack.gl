"use strict";
// ============================================================================
// Constants
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Configuration object for package.json properties, used to define metadata,
 * file inclusions, and other necessary project configurations.
 */
const packageConfig = {
    name: "",
    version: "",
    description: "",
    keywords: "",
    license: "Apache-2.0",
    homepage: "https://www.scape.agency",
    funding: [
        {
            "type": "github",
            "url": "https://github.com/sponsors/scape-foundation"
        }
    ],
    type: "module",
    main: "js/index",
    // main: "js/index.js",
    types: "js/index",
    // types: "js/index.d.ts",
    // "module": "dist/js/unit.gl.js",
    // "style": "dist/css/unit.gl.css",
    // "sass": "src/scss/index.scss",
    // main: 'index.js',
    files: [
        "code-snippets/**/*.code-snippets",
        "css/**/*.{css,map}",
        "font/**/*.{eot,otf,ttf,woff,woff2}",
        "inkscape/**/*.inkscape",
        "jinja/**/*.jinja",
        "js/**/*.d.ts",
        "js/**/*.{js,map}",
        "less/**/*.less",
        "md/**/*.md",
        "oco/**/*.oco",
        "png/**/*.png",
        "py/**/*.py",
        "rcpx/**/*.rcpx",
        "scss/**/*.scss",
        "sketchpalette/**/*.sketchpalette",
        "styl/**/*.styl",
        "svg/**/*.svg",
        "tex/**/*.tex",
        "ts/**/*.ts",
        "!.DS_Store"
    ],
    // exports: {
    //     ".": {
    //         // "sass": "./src/scss/index.scss",
    //         // "import": "./dist/js/index.mjs",
    //         // "default": "./dist/js/index.js"
    //         "sass": "./scss/index.scss",
    //         "scss": "./scss/index.scss",
    //         "typescript": "./ts/index.ts",
    //         "default": "./js/index.js"
    //     }
    // }
    // repository: {
    //     type: pack.repository.type,
    //     url: pack.repository.url,
    // },
    // author?: string | {
    //     name: string;
    //     email?: string;
    //     url?: string;
    // };
    // bugs?: {
    //     url?: string;
    //     email?: string;
    // };
    // contributors?: Array<string | {
    //     name: string;
    //     email?: string;
    //     url?: string;
    // }>;
    // funding?: string | {
    //     type: string;
    //     url: string;
    // };
};
// ============================================================================
// Export
// ============================================================================
exports.default = packageConfig;
