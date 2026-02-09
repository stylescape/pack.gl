// ============================================================================
// Import
// ============================================================================

import { DirectoryCleanAction } from "./DirectoryCleanAction/index.js";
import { DirectoryCopyAction } from "./DirectoryCopyAction/index.js";
import { DirectoryCreateAction } from "./DirectoryCreateAction/index.js";

import { DocumentationAction } from "./DocumentationAction/index.js";

import { FileCopyAction } from "./FileCopyAction/index.js";
import { FileRenameAction } from "./FileRenameAction/index.js";

import { PackageManagerAction } from "./PackageManagerAction/index.js";
import { RunScriptAction } from "./RunScriptAction/index.js";

import { TypeScriptCompilerAction } from "./TypeScriptCompilerAction/index.js";

import { VersionWriteAction } from "./VersionWriteAction/index.js";

import type { ActionInterface } from "../interface/ActionInterface.js";

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
