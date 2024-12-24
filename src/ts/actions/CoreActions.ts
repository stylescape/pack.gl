// CoreActions.ts

import { DirectoryCleanAction } from "../actions/DirectoryCleanAction/DirectoryCleanAction";
import { DirectoryCopyAction } from "../actions/DirectoryCopyAction/DirectoryCopyAction";
import { FileCopyAction } from "../actions/FileCopyAction/FileCopyAction";
import { PackageManagerAction } from "../actions/PackageManagerAction/PackageManagerAction";
import { StyleProcessingAction } from "../actions/StyleProcessingAction/StyleProcessingAction";
import { VersionWriteAction } from "../actions/VersionWriterAction/VersionWriterAction";
import { ActionInterface } from "../interface/ActionInterface";

/**
 * Enum for core action names.
 */
export enum CoreActionNames {
    DirectoryClean = "DirectoryCleanAction",
    DirectoryCopy = "DirectoryCopyAction",
    FileCopy = "FileCopyAction",
    PackageManager = "PackageManagerAction",
    StyleProcessing = "StyleProcessingAction",
    VersionWrite = "VersionWriteAction",
}

/**
 * A record mapping core action names to their respective classes.
 */
export const coreActions: Record<string, new () => ActionInterface> = {
    [CoreActionNames.DirectoryClean]: DirectoryCleanAction,
    [CoreActionNames.DirectoryCopy]: DirectoryCopyAction,
    [CoreActionNames.FileCopy]: FileCopyAction,
    [CoreActionNames.PackageManager]: PackageManagerAction,
    [CoreActionNames.StyleProcessing]: StyleProcessingAction,
    [CoreActionNames.VersionWrite]: VersionWriteAction,
};
