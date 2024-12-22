// ============================================================================
// Import
// ============================================================================

import ts from "typescript";


// ============================================================================
// Constants
// ============================================================================

// const tsConfig: ts.CompilerOptions = {
const tsConfig = {


    // Visit https://aka.ms/tsconfig.json to read more about this file


    // Projects
    // ========================================================================

    // incremental: true,                                   // boolean      // Enable incremental compilation
    // composite: true,                                     // boolean      // Enable constraints that allow a TypeScript project to be used with project references.
    // tsBuildInfoFile: "./",                             // Specify the folder for .tsbuildinfo incremental compilation files.
    // disableSourceOfProjectReferenceRedirect: true,       // boolean      // Disable preferring source files instead of declaration files when referencing composite projects
    // disableSolutionSearching: true,                      // boolean      // Opt a project out of multi-project reference checking when editing.
    // disableReferencedProjectLoad: true,                  // boolean      // Reduce the number of projects loaded automatically by TypeScript.
  

    // Language and Environment
    // ========================================================================

    // target: ts.ScriptTarget.ES2015,
    target: ts.ScriptTarget.ES2015, // ES6 equivalent
    // target: "es2015",                                     // Set the JavaScript language version for emitted JavaScript and include compatible library declarations.
    // target: "es6",                     // Specify ECMAScript target version
    // ES3 = 0,
    // ES5 = 1,
    // ES2015 = 2,
    // ES2016 = 3,
    // ES2017 = 4,
    // ES2018 = 5,
    // ES2019 = 6,
    // ES2020 = 7,
    // ES2021 = 8,
    // ES2022 = 9,
    // ESNext = 99,
    // JSON = 100,
    // Latest = 99,\


    lib: ["lib.es2015.d.ts", "lib.dom.d.ts"],
    // lib: ["ES2015", "DOM"], // Use correct enum values for lib options
    // lib: ["esnext", "es2017`", "ES2015", "dom"],           // Specify a set of bundled library declaration files that describe the target runtime environment.
    // lib: ["es2015", "dom"],             // Specify library files to be included in the compilation
    // lib: ["es2015"],             // Specify library files to be included in the compilation
    // jsx: "preserve",                                   // Specify what JSX code is generated.
    // experimentalDecorators: true,                         // Enable experimental support for TC39 stage 2 draft decorators.
    // emitDecoratorMetadata: true,                          // Emit design-type metadata for decorated declarations in source files.
    // jsxFactory: "",                                    // Specify the JSX factory function used when targeting React JSX emit, e.g. "React.createElement" or "h"
    // jsxFragmentFactory: "",                            // Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. "React.Fragment" or "Fragment".
    // jsxImportSource: "",                               // Specify module specifier used to import the JSX factory functions when using `jsx: react-jsx*`.`
    // reactNamespace: "",                                // Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit.
    // noLib: true,                                       // Disable including any library files, including the default lib.d.ts.
    // useDefineForClassFields: true,                      // Emit ECMAScript-standard-compliant class fields.
  

    // Modules
    // ========================================================================

        // module?: ModuleKind;
    // moduleResolution?: ModuleResolutionKind;
    // moduleSuffixes?: string[];
    // moduleDetection?: ModuleDetectionKind;

    module: ts.ModuleKind.CommonJS,
    // module: "commonjs",                // Specify module code generation
    // module: "CommonJS",
    // module: "esnext",                                      // Specify what module code is generated.
    // rootDir: ".",                                       // Specify the root folder within your source files.
    // moduleResolution: ts.ModuleResolutionKind.NodeJs, // Ensure module resolution is set correctly
    // moduleResolution: ts.ModuleResolutionKind.Node16, // Ensure module resolution is set correctly
    // moduleResolution: "node",                             // Specify how TypeScript looks up a file from a given module specifier.
    // baseUrl: "src"                                      // Specify the base directory to resolve non-relative module names.,
    // paths: {
    //   "@/*: ["./*"],
    //   "#/*: ["./*"]
    // },
    // rootDirs: [],                                      // Allow multiple folders to be treated as one when resolving modules.
    // typeRoots: [                                          // Specify multiple folders that act like `./node_modules/@types`.
    //     "node_modules/@types"
    // ],
    // types: [],                                         // Specify type package names to be included without being referenced in a source file.
    // allowUmdGlobalAccess: true,                        // Allow accessing UMD globals from modules.
    resolveJsonModule: true,                           // Enable importing .json files
    // noResolve: true,                                   // Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project.


    // JavaScript Support
    // ========================================================================

    // allowJs: true                    boolean                     // Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files.,
    // checkJs: false                                        // Enable error reporting in type-checked JavaScript files.,
    // maxNodeModuleJsDepth: 1,                           // Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with `allowJs`.


    // Emit
    // ========================================================================

    declaration: true, // Enables generation of .d.ts files

    //   "declaration: true,                                 // Generate .d.ts files from TypeScript and JavaScript files in your project.
//   "declarationMap: true,                              // Create sourcemaps for d.ts files.
    // emitDeclarationOnly: true,                         // Only output d.ts files and not JavaScript files.
    // sourceMap: true,                                      // Create source map files for emitted JavaScript files.
    // outFile: "./",                                     // Specify a file that bundles all outputs into one JavaScript file. If `declaration` is true, also designates a file that bundles all .d.ts output.
    // outDir: "./dist",                                  // Specify an output folder for all emitted files.
    // removeComments: true,                                 // Disable emitting comments.
    // noEmit: true,                                      // Disable emitting files from a compilation.
    // noImplicitReturns: true,
    // was true, maar es5/6 trekt dat niet
    // importHelpers: true,                                  // Allow importing helper functions from tslib once per project, instead of including them per-file.
    // importsNotUsedAsValues: "remove",                  // Specify emit/checking behavior for imports that are only used for types
    // downlevelIteration: false,                            // Emit more compliant, but verbose and less performant JavaScript for iteration.
    // sourceRoot: "",                                    // Specify the root path for debuggers to find the reference source code.
    // mapRoot: "",                                       // Specify the location where debugger should locate map files instead of generated locations.
    // inlineSourceMap: true,                             // Include sourcemap files inside the emitted JavaScript.
    // inlineSources: true,                               // Include source code in the sourcemaps inside the emitted JavaScript.
    // emitBOM: true,                                     // Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
    // newLine: "crlf",                                   // Set the newline character for emitting files.
    // stripInternal: true,                               // Disable emitting declarations that have `@internal` in their JSDoc comments.
    // noEmitHelpers: true,                               // Disable generating custom helper functions like `__extends` in compiled output.
    // noEmitOnError: false,                                 // Disable emitting files if any type checking errors are reported.
    // preserveConstEnums: true,                          // Disable erasing `const enum` declarations in generated code.
    // declarationDir: "./",                              // Specify the output directory for generated declaration files.
    // preserveValueImports: true,                        // Preserve unused imported values in the JavaScript output that would otherwise be removed.


    // Interop Constraints
    // ========================================================================

    // isolatedModules: true,                             // Ensure that each file can be safely transpiled without relying on other imports.
    allowSyntheticDefaultImports: true,                   // Allow "import x from y" when a module doesn"t have a default export.
    // Enables compatibility with Babel imports
    esModuleInterop: true,                                // Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility.
    // preserveSymlinks: true,                            // Disable resolving symlinks to their realpath. This correlates to the same flag in node.
    // forceConsistentCasingInFileNames: true,            // Ensure that casing is correct in imports.
    forceConsistentCasingInFileNames: true, // Disallow inconsistently-cased references


    // Type Checking
    // ========================================================================

    strict: true,                                          // Enable all strict type-checking options.,
    // noImplicitAny: true,                                  // Enable error reporting for expressions and declarations with an implied `any` type..
    // strictNullChecks: true,                               // When type checking, take into account `null` and `undefined`.
    // strictFunctionTypes: true,                            // When assigning functions, check to ensure parameters and the return values are subtype-compatible.
    // strictBindCallApply: true,                            // Check that the arguments for `bind`, `call`, and `apply` methods match the original function.
    // strictPropertyInitialization: true,                // Check for class properties that are declared but not set in the constructor.
    // noImplicitThis: true,                              // Enable error reporting when `this` is given the type `any`.
    // useUnknownInCatchVariables: true,                  // Type catch clause variables as "unknown" instead of "any".
    // alwaysStrict: true,                                // Ensure "use strict" is always emitted.
    // noUnusedLocals: true,                              // Enable error reporting when a local variables aren"t read.
    // noUnusedParameters: true,                          // Raise an error when a function parameter isn"t read
    // exactOptionalPropertyTypes: true,                  // Interpret optional property types as written, rather than adding "undefined".
    // noImplicitReturns: true,                           // Enable error reporting for codepaths that do not explicitly return in a function.
    // noFallthroughCasesInSwitch: true,                     // Enable error reporting for fallthrough cases in switch statements.
    // noUncheckedIndexedAccess: true,                    // Include "undefined" in index signature results
    // noImplicitOverride: true,                          // Ensure overriding members in derived classes are marked with an override modifier.
    // noPropertyAccessFromIndexSignature: true,          // Enforces using indexed accessors for keys declared using an indexed type
    // allowUnusedLabels: true,                           // Disable error reporting for unused labels.
    // allowUnreachableCode: true,                        // Disable error reporting for unreachable code.


    // Completeness
    // ========================================================================

    // skipDefaultLibCheck: true,                         // Skip type checking .d.ts files that are included with TypeScript.
    // Skip type checking of declaration files
    skipLibCheck: true,                                    // Skip type checking all .d.ts files.
  
    
    // Other
    // ========================================================================
    // allowImportingTsExtensions?: boolean;

    // allowJs?: boolean;
    // allowArbitraryExtensions?: boolean;
    // allowSyntheticDefaultImports?: boolean;
    // allowUmdGlobalAccess?: boolean;
    // allowUnreachableCode?: boolean;
    // allowUnusedLabels?: boolean;
    // alwaysStrict?: boolean;
    // baseUrl?: string;
    // charset?: string;
    // checkJs?: boolean;
    // customConditions?: string[];
    // declaration?: boolean;
    // declarationMap?: boolean;
    // emitDeclarationOnly?: boolean;
    // declarationDir?: string;
    // disableSizeLimit?: boolean;
    // disableSourceOfProjectReferenceRedirect?: boolean;
    // disableSolutionSearching?: boolean;
    // disableReferencedProjectLoad?: boolean;
    // downlevelIteration?: boolean;
    // emitBOM?: boolean;
    // emitDecoratorMetadata?: boolean;
    // exactOptionalPropertyTypes?: boolean;
    // experimentalDecorators?: boolean;
    // forceConsistentCasingInFileNames?: boolean;
    // ignoreDeprecations?: string;
    // importHelpers?: boolean;
    // importsNotUsedAsValues?: ImportsNotUsedAsValues;
    // inlineSourceMap?: boolean;
    // inlineSources?: boolean;
    // isolatedModules?: boolean;
    // jsx?: JsxEmit;
    // keyofStringsOnly?: boolean;
    // lib?: string[];
    // locale?: string;
    // mapRoot?: string;
    // maxNodeModuleJsDepth?: number;

    // newLine?: NewLineKind;
    // noEmit?: boolean;
    // noEmitHelpers?: boolean;
    // noEmitOnError?: boolean;
    // noErrorTruncation?: boolean;
    // noFallthroughCasesInSwitch?: boolean;
    // noImplicitAny?: boolean;
    // noImplicitReturns?: boolean;
    // noImplicitThis?: boolean;
    // noStrictGenericChecks?: boolean;
    // noUnusedLocals?: boolean;
    // noUnusedParameters?: boolean;
    // noImplicitUseStrict?: boolean;
    // noPropertyAccessFromIndexSignature?: boolean;
    // assumeChangesOnlyAffectDirectDependencies?: boolean;
    // noLib?: boolean;
    // noResolve?: boolean;
    // noUncheckedIndexedAccess?: boolean;
    // out?: string;
    // outDir?: string;
    // outFile: "icon.gl.js" // string;
    // paths?: MapLike<string[]>;
    // preserveConstEnums?: boolean;
    // noImplicitOverride?: boolean;
    // preserveSymlinks?: boolean;
    // preserveValueImports?: boolean;
    // project?: string;
    // reactNamespace?: string;
    // jsxFactory?: string;
    // jsxFragmentFactory?: string;
    // jsxImportSource?: string;
    // composite?: boolean;
    // incremental?: boolean;
    // tsBuildInfoFile?: string;
    // removeComments?: boolean;
    // resolvePackageJsonExports?: boolean;
    // resolvePackageJsonImports?: boolean;
    // rootDir?: string;
    // rootDirs?: string[];
    // skipLibCheck?: boolean;
    // skipDefaultLibCheck?: boolean;
    // sourceMap?: boolean;
    // sourceRoot?: string;
    // strict?: boolean;
    // strictFunctionTypes?: boolean;
    // strictBindCallApply?: boolean;
    // strictNullChecks?: boolean;
    // strictPropertyInitialization?: boolean;
    // stripInternal?: boolean;
    // suppressExcessPropertyErrors?: boolean;
    // suppressImplicitAnyIndexErrors?: boolean;
    // target?: ScriptTarget;
    // traceResolution?: boolean;
    // useUnknownInCatchVariables?: boolean;
    // resolveJsonModule?: boolean;
    // types?: string[];
    // /** Paths used to compute primary types search locations
    // typeRoots?: string[];
    // verbatimModuleSyntax?: boolean;
    // esModuleInterop?: boolean;
    // useDefineForClassFields?: boolean;
    // [option: string]: CompilerOptionsValue | TsConfigSourceFile | undefined;
};


// ============================================================================
// Export
// ============================================================================

export default tsConfig;
