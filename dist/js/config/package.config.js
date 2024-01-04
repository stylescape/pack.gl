"use strict";
// config/package.config.ts
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
// Constants
// ============================================================================
const packageConfig = {
    name: "",
    version: "",
    description: "",
    keywords: "",
    license: "Apache-2.0",
    homepage: "https://www.scape.agency",
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
        "!.DS_Store",
    ]
};
// ============================================================================
// Export
// ============================================================================
exports.default = packageConfig;
