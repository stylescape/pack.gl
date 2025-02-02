// // ============================================================================
// // Imports
// // ============================================================================

// // @ts-ignore: Implicit any type for sassdoc module
// import path from "path";
// import sassdoc from "sassdoc";
// import { Action } from "../../core/pipeline/Action";
// import { ActionOptionsType } from "../../types/ActionOptionsType";

// // ============================================================================
// // Classes
// // ============================================================================

// /**
//  * SassDocAction generates SASS documentation using SassDoc.
//  * This action allows specifying source directories, destination paths, and additional options.
//  */
// export class SassDocAction extends Action {
//     /**
//      * Executes the SASS documentation generation process.
//      *
//      * @param options - The options specifying source directories, output path, and SassDoc configurations.
//      * @returns A Promise that resolves when the documentation generation is completed successfully.
//      * @throws {Error} Throws an error if the documentation process fails.
//      */
//     async execute(options: ActionOptionsType): Promise<void> {
//         const {
//             sourcePaths = ["src/styles"],
//             outputPath = "docs/sass",
//             sassdocOptions = {},
//         } = options;

//         if (!Array.isArray(sourcePaths) || sourcePaths.length === 0) {
//             throw new Error("Invalid options: 'sourcePaths' must be a non-empty array.");
//         }

//         this.logInfo(`Generating SASS documentation in ${outputPath}...`);

//         try {
//             // Merge custom options with default options
//             const config: sassdoc.Options = {
//                 dest: path.resolve(outputPath),
//                 verbose: true,
//                 ...sassdocOptions,
//             };

//             // Run SassDoc to generate documentation
//             await sassdoc(sourcePaths, config);

//             this.logInfo(`SASS documentation successfully generated at: ${config.dest}`);
//         } catch (error) {
//             this.logError("An error occurred while generating SASS documentation.", error);
//             throw error;
//         }
//     }

//     /**
//      * Provides a description of the action.
//      *
//      * @returns A string description of the action.
//      */
//     describe(): string {
//         return "Generates SASS documentation using SassDoc.";
//     }
// }
