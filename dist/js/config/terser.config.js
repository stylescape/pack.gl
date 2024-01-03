"use strict";
// config/terser.config.ts
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
// ============================================================================
// Constants
// ============================================================================
// https://terser.org/docs/api-reference/
const terserConfig = {
    parse: {
    // parse options
    },
    compress: {
        // compress options
        drop_console: true, // Remove console.log statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.info', 'console.debug', 'console.warn'], // Remove specific console functions
        // defaults (default: true) -- Pass false to disable most default enabled compress transforms. Useful when you only want to enable a few compress options while disabling the rest.
        // Class and object literal methods are converted will also be
        // converted to arrow expressions if the resultant code is shorter:
        // m(){return x} becomes m:()=>x. To do this to regular ES5 functions
        // which don't use this or arguments, see unsafe_arrows.
        arrows: true
    },
    mangle: {
        // mangle options
        // Mangle names for obfuscation and size reduction
        properties: true
    },
    format: {
        // format options (can also use `output` for backwards compatibility)
        comments: false, // Remove comments to reduce file size
        beautify: false
    },
    sourceMap: {
    // source map options
    },
    // Define ECMAScript target version
    ecma: 5, // specify one of: 5, 2015, 2016, etc.
    enclose: false, // or specify true, or "args:values"
    keep_classnames: false, // Remove class names
    keep_fnames: false, // Remove function names
    ie8: false,
    module: false,
    nameCache: null, // or specify a name cache object
    safari10: false,
    toplevel: true
};
// ============================================================================
// Export
// ============================================================================
exports.default = terserConfig;
