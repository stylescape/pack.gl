// ============================================================================
// Progress Module
// ============================================================================

/**
 * Barrel export for kist's progress-reporting utilities: the
 * {@link ProgressReporter} class (tracks completed/total counts and prints
 * percentage/ETA to the log) and its two preconfigured factory functions,
 * {@link createFileProgress} and {@link createBuildProgress}.
 */

export {
    ProgressReporter,
    createFileProgress,
    createBuildProgress,
} from "./ProgressReporter.js";
