// ============================================================================
// Import
// ============================================================================

import { DirectoryCleanAction } from "../actions/DirectoryCleanAction";
import { DirectoryCopyAction } from "../actions/DirectoryCopyAction";
import { DirectoryCreateAction } from "../actions/DirectoryCreateAction";

import { DocumentationAction } from "../actions/DocumentationAction";

import { FileCopyAction } from "../actions/FileCopyAction";
import { FileRenameAction } from "../actions/FileRenameAction";

import { JavaScriptMinifyAction } from "../actions/JavaScriptMinifyAction";
import { LintAction } from "../actions/LintAction";

import { PackageManagerAction } from "../actions/PackageManagerAction";
import { RunScriptAction } from "../actions/RunScriptAction";

import { StyleProcessingAction } from "../actions/StyleProcessingAction";

import { SvgPackagerAction } from "../actions/SvgPackagerAction";
import { SvgReaderAction } from "../actions/SvgReaderAction";
import { SvgSpriteAction } from "../actions/SvgSpriteAction";
import { SvgToPngAction } from "../actions/SvgToPngAction";

import { TemplateRenderAction } from "../actions/TemplateRenderAction";
import { TypeScriptCompilerAction } from "../actions/TypeScriptCompilerAction";

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

    [new DocumentationAction().name]: DocumentationAction,

    [new FileCopyAction().name]: FileCopyAction,
    [new FileRenameAction().name]: FileRenameAction,

    [new JavaScriptMinifyAction().name]: JavaScriptMinifyAction,
    [new LintAction().name]: LintAction,

    [new PackageManagerAction().name]: PackageManagerAction,
    [new RunScriptAction().name]: RunScriptAction,
    [new StyleProcessingAction().name]: StyleProcessingAction,

    [new SvgPackagerAction().name]: SvgPackagerAction,
    [new SvgReaderAction().name]: SvgReaderAction,
    [new SvgSpriteAction().name]: SvgSpriteAction,
    [new SvgToPngAction().name]: SvgToPngAction,

    [new TemplateRenderAction().name]: TemplateRenderAction,
    [new TypeScriptCompilerAction().name]: TypeScriptCompilerAction,

    [new VersionWriteAction().name]: VersionWriteAction,
};
