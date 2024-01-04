// interface/PackageJson.ts

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
// Interfaces
// ============================================================================

export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    main?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    repository?: {
        type: string;
        url: string;
    };
    keywords?: string[];
    author?: string | {
        name: string;
        email?: string;
        url?: string;
    };
    license?: string;
    bugs?: {
        url?: string;
        email?: string;
    };
    homepage?: string;
    private?: boolean;
    peerDependencies?: Record<string, string>;
    engines?: {
        node?: string;
        npm?: string;
    };
    bin?: Record<string, string>;
    types?: string;
    contributors?: Array<string | {
        name: string;
        email?: string;
        url?: string;
    }>;
    funding?: string | {
        type: string;
        url: string;
    };
    files?: string[];
    browserslist?: string[] | Record<string, string[]>;
    publishConfig?: Record<string, any>;
    config?: Record<string, any>;
    typings?: string;
    exports?: Record<string, any>;
    module?: string;
    sideEffects?: boolean | string[];

    optionalDependencies?: Record<string, string>;
    bundledDependencies?: string[]; // or bundleDependencies
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    resolutions?: Record<string, string>;
    workspaces?: string[] | {
      packages: string[];
    };
    eslintConfig?: Record<string, any>;
    babel?: Record<string, any>;
    prettier?: Record<string, any>;
    husky?: Record<string, any>;
    jest?: Record<string, any>;
    enginesStrict?: boolean;
    os?: string[];
    cpu?: string[];
}
