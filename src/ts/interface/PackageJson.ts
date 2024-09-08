// ============================================================================
// Import
// ============================================================================

// import { Record, string, optional, array, union } from 'runtypes';


// ============================================================================
// Interfaces
// ============================================================================

/**
 * TypeScript interface describing the structure of a package.json file.
 * This interface includes all standard fields used by npm, as well as common fields
 * used by related tools like Yarn, and can be extended with custom fields as needed.
 */
export interface PackageJson {

    name: string;  // The name of the package.
    version: string;  // The version of the package.
    description?: string;  // A brief description of the package.
    main?: string;  // The entry point for the package.
    scripts?: Record<string, string>;  // Scripts that can be executed with npm/yarn.
    dependencies?: Record<string, string>;  // Production dependencies of the package.
    devDependencies?: Record<string, string>;  // Development dependencies of the package.
    repository?: {  // Repository information for the package.
        type: string;
        url: string;
    };
    keywords?: string[];  // Keywords associated with the package.
    author?: string | {  // The author of the package.
        name: string;
        email?: string;
        url?: string;
    };
    license?: string;  // The license under which the package is provided.
    bugs?: {  // Links to the package bug tracker.
        url?: string;
        email?: string;
    };
    homepage?: string;  // The URL to the homepage of the package.
    private?: boolean;  // Indicates if the package should be published.
    peerDependencies?: Record<string, string>;  // Peer dependencies of the package.
    engines?: {  // Engine requirements for the package.
        node?: string;
        npm?: string;
    };
    bin?: Record<string, string>;  // Executable files included with the package.
    types?: string;  // Path to the TypeScript declaration files.
    contributors?: Array<string | {  // Other contributors to the package.
        name: string;
        email?: string;
        url?: string;
    }>;
    funding?: string | {  // Funding information for the package.
        type: string;
        url: string;
    };
    files?: string[];  // An array of file patterns included in the package.
    browserslist?: string[] | Record<string, string[]>;  // Target browsers/environments for tools like Babel.
    publishConfig?: Record<string, any>;  // Configuration for publishing the package.
    config?: Record<string, any>;  // Configuration parameters used in scripts.
    typings?: string;  // Alternative to "types", path to TypeScript declaration files.
    exports?: Record<string, any>;  // Define export map for submodules and conditions.
    module?: string;  // Specify an ES module entry point.
    sideEffects?: boolean | string[];  // Indicate which modules in the package have side effects.

    optionalDependencies?: Record<string, string>;  // Optional dependencies.
    bundledDependencies?: string[];  // Dependencies to be bundled with the package.
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;  // Metadata for peer dependencies.
    resolutions?: Record<string, string>;  // Dependency resolution hints for yarn.
    workspaces?: string[] | {  // Workspace configuration for managing multiple packages.
      packages: string[];
    };
    eslintConfig?: Record<string, any>;  // ESLint configuration embedded in package.json.
    babel?: Record<string, any>;  // Babel configuration embedded in package.json.
    prettier?: Record<string, any>;  // Prettier configuration embedded in package.json.
    husky?: Record<string, any>;  // Husky configuration for Git hooks.
    jest?: Record<string, any>;  // Jest configuration for unit tests.
    enginesStrict?: boolean;  // Enforce engine requirements strictly.
    os?: string[];  // Specify OS compatibility.
    cpu?: string[];  // Specify CPU architecture compatibility.

    
}
