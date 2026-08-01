// ============================================================================
// Abstract Base Class Exports
// ============================================================================

/**
 * Barrel export for kist's foundational base classes: {@link AbstractProcess}
 * (adds context-tagged logging via the shared {@link Logger}, extended by
 * almost every core class), {@link AbstractSingleton} (generic singleton
 * enforcement), and {@link AbstractValidator} (shared per-property validation
 * helpers used by the `core/validation` classes).
 */

export { AbstractProcess } from "./AbstractProcess.js";
export { AbstractSingleton } from "./AbstractSingleton.js";
export { AbstractValidator } from "./AbstractValidator.js";
