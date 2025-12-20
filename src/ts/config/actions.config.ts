// ============================================================================
// Core Actions Configuration
// ============================================================================

/**
 * Defines which actions are considered "core" and will remain in the main
 * kist package. All other actions should be moved to separate plugin packages.
 *
 * Core Actions (Lightweight essentials):
 * - Directory operations (create, copy, clean)
 * - File operations (copy, rename)
 * - Version management
 * - Template rendering (lightweight)
 *
 * Plugin Actions (Move to separate repos):
 * - StyleProcessingAction -> @kist/action-sass
 * - TypeScriptCompilerAction -> @kist/action-typescript
 * - JavaScriptMinifyAction -> @kist/action-terser
 * - SvgPackagerAction -> @kist/action-svg
 * - SvgSpriteAction -> @kist/action-svg
 * - SvgToPngAction -> @kist/action-svg
 * - SvgReaderAction -> @kist/action-svg
 * - LintAction -> @kist/action-lint
 * - DocumentationAction -> @kist/action-docs
 * - PackageManagerAction -> @kist/action-package-manager
 * - RunScriptAction -> @kist/action-scripts
 */

export const CORE_ACTIONS = [
    "DirectoryCleanAction",
    "DirectoryCopyAction",
    "DirectoryCreateAction",
    "FileCopyAction",
    "FileRenameAction",
    "TemplateRenderAction",
    "VersionWriteAction",
] as const;

export const PLUGIN_ACTIONS = [
    // @kist/action-sass
    "StyleProcessingAction",

    // @kist/action-typescript
    "TypeScriptCompilerAction",

    // @kist/action-terser
    "JavaScriptMinifyAction",

    // @kist/action-svg
    "SvgPackagerAction",
    "SvgReaderAction",
    "SvgSpriteAction",
    "SvgToPngAction",

    // @kist/action-lint
    "LintAction",

    // @kist/action-docs
    "DocumentationAction",

    // @kist/action-package-manager
    "PackageManagerAction",

    // @kist/action-scripts
    "RunScriptAction",
] as const;

export type CoreActionName = (typeof CORE_ACTIONS)[number];
export type PluginActionName = (typeof PLUGIN_ACTIONS)[number];

/**
 * Plugin package mappings for migration guide
 */
export const PLUGIN_PACKAGES: Record<
    PluginActionName,
    {
        package: string;
        npm: string;
        github: string;
    }
> = {
    StyleProcessingAction: {
        package: "@kist/action-sass",
        npm: "npm install --save-dev @kist/action-sass",
        github: "https://github.com/getkist/action-sass",
    },
    TypeScriptCompilerAction: {
        package: "@kist/action-typescript",
        npm: "npm install --save-dev @kist/action-typescript",
        github: "https://github.com/getkist/action-typescript",
    },
    JavaScriptMinifyAction: {
        package: "@kist/action-terser",
        npm: "npm install --save-dev @kist/action-terser",
        github: "https://github.com/getkist/action-terser",
    },
    SvgPackagerAction: {
        package: "@kist/action-svg",
        npm: "npm install --save-dev @kist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    SvgReaderAction: {
        package: "@kist/action-svg",
        npm: "npm install --save-dev @kist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    SvgSpriteAction: {
        package: "@kist/action-svg",
        npm: "npm install --save-dev @kist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    SvgToPngAction: {
        package: "@kist/action-svg",
        npm: "npm install --save-dev @kist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    LintAction: {
        package: "@kist/action-lint",
        npm: "npm install --save-dev @kist/action-lint",
        github: "https://github.com/getkist/action-lint",
    },
    DocumentationAction: {
        package: "@kist/action-docs",
        npm: "npm install --save-dev @kist/action-docs",
        github: "https://github.com/getkist/action-docs",
    },
    PackageManagerAction: {
        package: "@kist/action-package-manager",
        npm: "npm install --save-dev @kist/action-package-manager",
        github: "https://github.com/getkist/action-package-manager",
    },
    RunScriptAction: {
        package: "@kist/action-scripts",
        npm: "npm install --save-dev @kist/action-scripts",
        github: "https://github.com/getkist/action-scripts",
    },
};
