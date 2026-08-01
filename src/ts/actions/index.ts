// ============================================================================
// Core Action Exports
// ============================================================================

/**
 * Barrel export for the actions bundled with the main `kist` package (see
 * {@link CORE_ACTIONS} in `../config/actions.config.ts` for the authoritative
 * list, and {@link coreActions} below for the name-to-class map the
 * `ActionRegistry` pre-registers on startup). Actions that moved to separate
 * `@getkist/action-*` plugin packages are listed in
 * {@link MIGRATED_ACTIONS} instead and are not exported from here.
 */

export { coreActions } from "./CoreActions.js";

export { DirectoryCleanAction } from "./DirectoryCleanAction/index.js";
export { DirectoryCopyAction } from "./DirectoryCopyAction/index.js";
export { DirectoryCreateAction } from "./DirectoryCreateAction/index.js";
export { DocumentationAction } from "./DocumentationAction/index.js";
export { FileCopyAction } from "./FileCopyAction/index.js";
export { FileRenameAction } from "./FileRenameAction/index.js";
export { PackageManagerAction } from "./PackageManagerAction/index.js";
export { RunScriptAction } from "./RunScriptAction/index.js";
export { TypeScriptCompilerAction } from "./TypeScriptCompilerAction/index.js";
export { VersionWriteAction } from "./VersionWriteAction/index.js";
