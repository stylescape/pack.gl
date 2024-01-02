// config/package.config.ts

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

import * as pack_object from '../../../package.json' assert { type: 'json' };

const pack = JSON.parse(JSON.stringify(pack_object)).default; // req.body = [Object: null prototype] { title: 'product' }


const packageConfig = {
    name: pack.name,
    version: pack.version,
    description: pack.description,
    keywords: pack.keywords,
    license: pack.license,
    homepage: pack.homepage,
    main: 'index.js',
    files: [
        "svg/**/*.{svg}",
        "js/**/*.{js,map}",
        "ts/**/*.ts",
        "css/**/*.{css,map}",
        "scss/**/*.{scss}",
        "font/**/*.{eot,otf,ttf,woff,woff2}",
        "!.DS_Store"
    ],
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


}

// ============================================================================
// Export
// ============================================================================

export default packageConfig;
