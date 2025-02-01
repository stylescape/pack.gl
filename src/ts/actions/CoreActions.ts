// ============================================================================
// Import
// ============================================================================

import { DirectoryCleanAction } from "../actions/DirectoryCleanAction";
import { DirectoryCopyAction } from "../actions/DirectoryCopyAction";
import { DirectoryCreateAction } from "../actions/DirectoryCreateAction";

import { FileCopyAction } from "../actions/FileCopyAction";

import { PackageManagerAction } from "../actions/PackageManagerAction";

import { StyleProcessingAction } from "../actions/StyleProcessingAction";

import { VersionWriteAction } from "../actions/VersionWriteAction";



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
    [new DirectoryCreateAction().name]: DirectoryCreateAction,
    [new FileCopyAction().name]: FileCopyAction,
    [new PackageManagerAction().name]: PackageManagerAction,
    [new StyleProcessingAction().name]: StyleProcessingAction,
    [new VersionWriteAction().name]: VersionWriteAction,
};
