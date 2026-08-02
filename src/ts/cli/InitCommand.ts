// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import path from "path";
import { KIST_SCHEMA } from "../config/kistSchema.js";
import { CLIError } from "../errors/index.js";

// ============================================================================
// Constants
// ============================================================================

/**
 * Templates offered by `kist init`. Each is a complete, runnable
 * configuration: a first run should do something real rather than fail on a
 * placeholder.
 */
export const INIT_TEMPLATES = ["minimal", "package"] as const;

/**
 * Name of a template accepted by {@link renderTemplate}.
 */
export type InitTemplate = (typeof INIT_TEMPLATES)[number];

/**
 * The modeline that points editors at the schema. Recognised by
 * yaml-language-server (VS Code, Neovim); JetBrains editors read the
 * `# $schema:` form, which is emitted alongside it.
 */
const SCHEMA_HEADER = [
    `# yaml-language-server: $schema=${KIST_SCHEMA.$id}`,
    `# $schema: ${KIST_SCHEMA.$id}`,
].join("\n");

// ============================================================================
// Functions
// ============================================================================

/**
 * Renders the contents of a starter configuration file.
 *
 * @param template - Which starter to render.
 * @returns The YAML document, including the schema modeline.
 */
export function renderTemplate(template: InitTemplate): string {
    if (template === "package") {
        return `${SCHEMA_HEADER}

# kist pipeline for building and packaging an npm package.
# Run it with: npx kist
# Inspect it without running it with: npx kist --dry-run

options:
    logLevel: info

    # Steps that declare 'inputs' are skipped when those inputs are unchanged.
    cache:
        enabled: true

stages:
    - name: build
      description: Compile TypeScript and stage the published files.
      steps:
          - name: clean
            action: DirectoryCleanAction
            options:
                dirPath: "./dist"

          - name: compile
            action: TypeScriptCompilerAction
            inputs:
                - "src/**/*.ts"
                - "tsconfig.json"
            outputs:
                - "dist/**"
            options:
                tsConfigPath: "./tsconfig.json"
                outputDir: "./dist"

    - name: package
      description: Copy the files that ship with the package.
      dependsOn:
          - build
      steps:
          - name: copy-readme
            action: FileCopyAction
            options:
                srcFile: "./README.md"
                destDir: "./dist"

          - name: copy-license
            action: FileCopyAction
            options:
                srcFile: "./LICENSE"
                destDir: "./dist"
`;
    }

    return `${SCHEMA_HEADER}

# A minimal kist pipeline.
# Run it with: npx kist
# Inspect it without running it with: npx kist --dry-run

stages:
    - name: build
      steps:
          - name: clean
            action: DirectoryCleanAction
            options:
                dirPath: "./dist"

          - name: copy-readme
            action: FileCopyAction
            options:
                srcFile: "./README.md"
                destDir: "./dist"
`;
}

/**
 * Writes a starter configuration file.
 *
 * Refuses to overwrite an existing file unless asked: a `kist.yml` already in
 * the directory is more likely to be someone's work than a leftover.
 *
 * @param options - Destination, template, and overwrite behaviour.
 * @returns The absolute path written.
 * @throws CLIError if the file exists and `force` was not set.
 */
export function writeInitialConfig(options: {
    directory?: string;
    template?: InitTemplate;
    force?: boolean;
    filename?: string;
}): string {
    const directory = path.resolve(options.directory ?? process.cwd());
    const filename = options.filename ?? "kist.yml";
    const target = path.join(directory, filename);

    if (fs.existsSync(target) && !options.force) {
        throw new CLIError(
            `${target} already exists. Pass --force to overwrite it.`,
            { path: target },
        );
    }

    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(
        target,
        renderTemplate(options.template ?? "minimal"),
        "utf-8",
    );

    return target;
}
