// ============================================================================
// Import
// ============================================================================

// import { Record, string, optional, array, union } from 'runtypes';


// ============================================================================
// Interfaces
// ============================================================================

/**
 * TypeScript interface describing the structure of a package.json file.
 * This interface includes all standard fields used by npm, as well as common
 * fields used by related tools like Yarn, and can be extended with custom
 * fields as needed.
 */
export interface PackageJson {

    // The name of the package.
    name: string;

    // The version of the package.
    version: string;

    // A brief description of the package.
    description?: string;

    // The entry point for the package.
    main?: string;

    // Scripts that can be executed with npm/yarn.
    scripts?: Record<string, string>;

    // Production dependencies of the package.
    dependencies?: Record<string, string>;

    // Development dependencies of the package.
    devDependencies?: Record<string, string>;

    // Repository information for the package.
    repository?: {
        type: string;
        url: string;
    };

    // Keywords associated with the package.
    keywords?: string[];

    // The author of the package.
    author?: string | {
        name: string;
        email?: string;
        url?: string;
    };

    // The license under which the package is provided.
    license?: string;

    // Links to the package bug tracker.
    bugs?: {
        url?: string;
        email?: string;
    };

    // The URL to the homepage of the package.
    homepage?: string;

    // Indicates if the package should be published.
    private?: boolean;

    // Peer dependencies of the package.
    peerDependencies?: Record<string, string>;

    // Engine requirements for the package.
    engines?: {
        node?: string;
        npm?: string;
    };

    // Executable files included with the package.
    bin?: Record<string, string>;

    // Path to the TypeScript declaration files.
    types?: string;

    // Other contributors to the package.
    contributors?: Array<string | {
        name: string;
        email?: string;
        url?: string;
    }>;

    // Funding information for the package.
    funding?: string | {
        type: string;
        url: string;
    };

    // An array of file patterns included in the package.
    files?: string[];

    // Target browsers/environments for tools like Babel.
    browserslist?: string[] | Record<string, string[]>;

    // Configuration for publishing the package.
    publishConfig?: Record<string, any>;

    // Configuration parameters used in scripts.
    config?: Record<string, any>;

    // Alternative to "types", path to TypeScript declaration files.
    typings?: string;

    // Define export map for submodules and conditions.
    exports?: Record<string, any>;

    // Specify an ES module entry point.
    module?: string;

    // Indicate which modules in the package have side effects.
    sideEffects?: boolean | string[];

    // Optional dependencies.
    optionalDependencies?: Record<string, string>;

    // Dependencies to be bundled with the package.
    bundledDependencies?: string[];

    // Metadata for peer dependencies.
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;

    // Dependency resolution hints for yarn.
    resolutions?: Record<string, string>;

    // Workspace configuration for managing multiple packages.
    workspaces?: string[] | {
      packages: string[];
    };

    // ESLint configuration embedded in package.json.
    eslintConfig?: Record<string, any>;

    // Babel configuration embedded in package.json.
    babel?: Record<string, any>;

    // Prettier configuration embedded in package.json.
    prettier?: Record<string, any>;

    // Husky configuration for Git hooks.
    husky?: Record<string, any>;

    // Jest configuration for unit tests.
    jest?: Record<string, any>;

    // Enforce engine requirements strictly.
    enginesStrict?: boolean;

    // Specify OS compatibility.
    os?: string[];

    // Specify CPU architecture compatibility.
    cpu?: string[];

}
