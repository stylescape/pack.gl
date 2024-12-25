
// ============================================================================
// Import
// ============================================================================

import { DirectoryCleanAction } from "../actions/DirectoryCleanAction/DirectoryCleanAction";
import { DirectoryCopyAction } from "../actions/DirectoryCopyAction/DirectoryCopyAction";
import { FileCopyAction } from "../actions/FileCopyAction/FileCopyAction";
import { PackageManagerAction } from "../actions/PackageManagerAction/PackageManagerAction";
import { StyleProcessingAction } from "../actions/StyleProcessingAction/StyleProcessingAction";
import { VersionWriteAction } from "../actions/VersionWriterAction/VersionWriterAction";
import { ActionInterface } from "../interface/ActionInterface";

// ============================================================================
// Core Actions
// ============================================================================

/**
 * A record of core actions, mapped by their unique `name` property.
 * Automatically derives names from the action classes.
 */
export const coreActions: Record<string, new () => ActionInterface> = {
    [new DirectoryCleanAction().name]: DirectoryCleanAction,
    [new DirectoryCopyAction().name]: DirectoryCopyAction,
    [new FileCopyAction().name]: FileCopyAction,
    [new PackageManagerAction().name]: PackageManagerAction,
    [new StyleProcessingAction().name]: StyleProcessingAction,
    [new VersionWriteAction().name]: VersionWriteAction,
};