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
 * - StyleProcessingAction -> @getkist/action-sass
 * - TypeScriptCompilerAction -> @getkist/action-typescript
 * - JavaScriptMinifyAction -> @getkist/action-terser
 * - SvgPackagerAction -> @getkist/action-svg
 * - SvgSpriteAction -> @getkist/action-svg
 * - SvgToPngAction -> @getkist/action-svg
 * - SvgReaderAction -> @getkist/action-svg
 * - LintAction -> @getkist/action-lint
 * - DocumentationAction -> @getkist/action-docs
 * - PackageManagerAction -> @getkist/action-package-manager
 * - RunScriptAction -> @getkist/action-scripts
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
    // @getkist/action-sass
    "StyleProcessingAction",

    // @getkist/action-typescript
    "TypeScriptCompilerAction",

    // @getkist/action-terser
    "JavaScriptMinifyAction",

    // @getkist/action-svg
    "SvgPackagerAction",
    "SvgReaderAction",
    "SvgSpriteAction",
    "SvgToPngAction",

    // @getkist/action-lint
    "LintAction",

    // @getkist/action-docs
    "DocumentationAction",

    // @getkist/action-package-manager
    "PackageManagerAction",

    // @getkist/action-scripts
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
        package: "@getkist/action-sass",
        npm: "npm install --save-dev @getkist/action-sass",
        github: "https://github.com/getkist/action-sass",
    },
    TypeScriptCompilerAction: {
        package: "@getkist/action-typescript",
        npm: "npm install --save-dev @getkist/action-typescript",
        github: "https://github.com/getkist/action-typescript",
    },
    JavaScriptMinifyAction: {
        package: "@getkist/action-terser",
        npm: "npm install --save-dev @getkist/action-terser",
        github: "https://github.com/getkist/action-terser",
    },
    SvgPackagerAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    SvgReaderAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    SvgSpriteAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    SvgToPngAction: {
        package: "@getkist/action-svg",
        npm: "npm install --save-dev @getkist/action-svg",
        github: "https://github.com/getkist/action-svg",
    },
    LintAction: {
        package: "@getkist/action-lint",
        npm: "npm install --save-dev @getkist/action-lint",
        github: "https://github.com/getkist/action-lint",
    },
    DocumentationAction: {
        package: "@getkist/action-docs",
        npm: "npm install --save-dev @getkist/action-docs",
        github: "https://github.com/getkist/action-docs",
    },
    PackageManagerAction: {
        package: "@getkist/action-package-manager",
        npm: "npm install --save-dev @getkist/action-package-manager",
        github: "https://github.com/getkist/action-package-manager",
    },
    RunScriptAction: {
        package: "@getkist/action-scripts",
        npm: "npm install --save-dev @getkist/action-scripts",
        github: "https://github.com/getkist/action-scripts",
    },
};
