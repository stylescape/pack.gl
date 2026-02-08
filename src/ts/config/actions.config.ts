// ============================================================================
// Core Actions Configuration
// ============================================================================

/**
 * Defines which actions are in the main kist package vs. separate plugins.
 *
 * Core Actions (in main kist package):
 * - Directory operations (create, copy, clean)
 * - File operations (copy, rename)
 * - Version management
 * - TypeScript compilation
 * - Documentation generation
 * - Package management
 * - Script running
 *
 * Migrated to Plugin Packages:
 * - StyleProcessingAction -> @getkist/action-sass
 * - JavaScriptMinifyAction -> @getkist/action-terser
 * - SvgPackagerAction -> @getkist/action-svg
 * - SvgSpriteAction -> @getkist/action-svg
 * - SvgToPngAction -> @getkist/action-svg
 * - SvgReaderAction -> @getkist/action-svg
 * - LintAction -> @getkist/action-eslint
 * - TemplateRenderAction -> @getkist/action-nunjucks
 */

export const CORE_ACTIONS = [
    "DirectoryCleanAction",
    "DirectoryCopyAction",
    "DirectoryCreateAction",
    "DocumentationAction",
    "FileCopyAction",
    "FileRenameAction",
    "PackageManagerAction",
    "RunScriptAction",
    "TypeScriptCompilerAction",
    "VersionWriteAction",
] as const;

export const MIGRATED_ACTIONS = [
    // @getkist/action-sass
    "StyleProcessingAction",

    // @getkist/action-terser
    "JavaScriptMinifyAction",

    // @getkist/action-svg
    "SvgPackagerAction",
    "SvgReaderAction",
    "SvgSpriteAction",
    "SvgToPngAction",

    // @getkist/action-eslint
    "LintAction",

    // @getkist/action-nunjucks
    "TemplateRenderAction",
] as const;

export type CoreActionName = (typeof CORE_ACTIONS)[number];
export type MigratedActionName = (typeof MIGRATED_ACTIONS)[number];

/**
 * Plugin package mappings - use these packages for the migrated actions
 */
export const MIGRATED_PACKAGES: Record<
    MigratedActionName,
    {
        package: string;
        npm: string;
        github: string;
    }
> = {
    StyleProcessingAction: {
        package: "@getkist/action-sass",
        npm: "npm install --save-dev @getkist/action-sass",
        github: "https://github.com/getkist/kist-action-sass",
    },
    JavaScriptMinifyAction: {
        package: "@getkist/action-terser",
        npm: "npm install --save-dev @getkist/action-terser",
        github: "https://github.com/getkist/kist-action-terser",
    },
    SvgPackagerAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/kist-action-svg",
    },
    SvgReaderAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/kist-action-svg",
    },
    SvgSpriteAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/kist-action-svg",
    },
    SvgToPngAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/kist-action-svg",
    },
    LintAction: {
        package: "@getkist/action-eslint",
        npm: "npm install --save-dev @getkist/action-eslint",
        github: "https://github.com/getkist/kist-action-eslint",
    },
    TemplateRenderAction: {
        package: "@getkist/action-nunjucks",
        npm: "npm install --save-dev @getkist/action-nunjucks",
        github: "https://github.com/getkist/kist-action-nunjucks",
    },
};
