// // ============================================================================
// // Imports
// // ============================================================================

// // @ts-ignore: Implicit any type for sassdoc module
// import path from "path";
// // import sassdoc from "sassdoc";
// var sassdoc = require('sassdoc');

// // ============================================================================
// // Classes
// // ============================================================================

// /**
//  * SassDocGenerator is responsible for generating SASS documentation using
//  * SassDoc. It provides methods to configure and execute the documentation
//  * generation process.
//  */
// class SassDocGenerator {
//     // Parameters
//     // ========================================================================

//     // Constructor
//     // ========================================================================

//     // Methods
//     // ========================================================================

//     /**
//      * Generates SASS documentation for the specified source files or
//      * directories.
//      * @param sourcePaths - Array of file or directory paths to generate
//      * documentation for.
//      * @param destDir - The directory where the generated documentation
//      * should be saved.
//      * @param options - Additional options for SassDoc configuration.
//      * @returns A promise that resolves when documentation generation is
//      * complete.
//      */
//     public async generateDocumentation(
//         sourcePaths: string[],
//         destDir: string,
//         options: sassdoc.Options = {},
//     ): Promise<void> {
//         try {
//             // Merge custom options with default options
//             const config: sassdoc.Options = {
//                 dest: path.resolve(destDir),
//                 verbose: true,
//                 ...options,
//             };
//             console.log(`SASS`);

//             // Run SassDoc to generate the documentation
//             await sassdoc(sourcePaths, config);

//             console.log(
//                 `SASS documentation successfully generated at: ${config.dest}`,
//             );
//         } catch (error) {
//             console.error(
//                 "An error occurred while generating SASS documentation:",
//                 error,
//             );
//             throw error;
//         }
//     }
// }

// // ============================================================================
// // Exports
// // ============================================================================

// export default SassDocGenerator;
