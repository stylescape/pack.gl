// ============================================================================
// Import
// ============================================================================

import { DirectoryCleanAction } from "../actions/DirectoryCleanAction";
import { DirectoryCopyAction } from "../actions/DirectoryCopyAction";
import { DirectoryCreateAction } from "../actions/DirectoryCreateAction";

import { DocumentationAction } from "../actions/DocumentationAction";

import { FileCopyAction } from "../actions/FileCopyAction";
import { FileRenameAction } from "../actions/FileRenameAction";

import { PackageManagerAction } from "../actions/PackageManagerAction";
import { RunScriptAction } from "../actions/RunScriptAction";

import { TypeScriptCompilerAction } from "../actions/TypeScriptCompilerAction";

import { VersionWriteAction } from "../actions/VersionWriteAction";

import { ActionInterface } from "../interface/ActionInterface";

// ============================================================================
// Core Actions
// ============================================================================

/**
 * A record of core actions, mapped by their unique `name` property.
 * Automatically derives names from the action classes.
 * 
 * Note: Additional actions are available in separate @getkist/action-* packages:
 * - @getkist/action-eslint - ESLint linting
 * - @getkist/action-jest - Jest test runner
 * - @getkist/action-nunjucks - Nunjucks/Jinja templating
 * - @getkist/action-postcss - PostCSS processing
 * - @getkist/action-prettier - Prettier formatting
 * - @getkist/action-sass - SASS/SCSS compilation
 * - @getkist/action-svg - SVG sprite generation and optimization
 * - @getkist/action-terser - JavaScript minification
 * - @getkist/action-tsdown - tsdown bundling
 * - @getkist/action-tsup - tsup bundling
 */
export const coreActions: Record<string, new () => ActionInterface> = {
    [new DirectoryCleanAction().name]: DirectoryCleanAction,
    [new DirectoryCopyAction().name]: DirectoryCopyAction,
    [new DirectoryCreateAction().name]: DirectoryCreateAction,

    [new DocumentationAction().name]: DocumentationAction,

    [new FileCopyAction().name]: FileCopyAction,
    [new FileRenameAction().name]: FileRenameAction,

    [new PackageManagerAction().name]: PackageManagerAction,
    [new RunScriptAction().name]: RunScriptAction,

    [new TypeScriptCompilerAction().name]: TypeScriptCompilerAction,

    [new VersionWriteAction().name]: VersionWriteAction,
};
