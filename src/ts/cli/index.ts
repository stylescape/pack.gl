// ============================================================================
// CLI Exports
// ============================================================================

/**
 * Barrel export for kist's CLI argument-handling utilities. Exposes
 * {@link ArgumentParser} for reading flags off `process.argv`; the CLI's
 * runnable entry point itself lives in `../cli.ts` and is deliberately not
 * re-exported here (see the note in `../index.ts`).
 */

export { ArgumentParser } from "./ArgumentParser.js";
