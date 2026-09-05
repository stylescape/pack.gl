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
 * What the project being scaffolded already contains, so the rendered
 * pipeline only refers to files that exist.
 */
export interface TemplateContext {
    /** Whether the project has a README.md. */
    hasReadme?: boolean;

    /** Whether the project has a LICENSE. */
    hasLicense?: boolean;
}

/**
 * The step that copies README.md, or nothing when there is no README.
 *
 * @param hasReadme - Whether the project has a README.md.
 * @returns A YAML fragment.
 */
function readmeStep(hasReadme: boolean): string {
    if (!hasReadme) return "";
    return `
          - name: copy-readme
            action: FileCopyAction
            options:
                srcFile: "./README.md"
                destDir: "./dist"
`;
}

/**
 * Renders the contents of a starter configuration file.
 *
 * Steps that copy README.md or LICENSE appear only when those files are
 * actually present. Emitting them unconditionally meant the first `kist` run
 * of a freshly initialised project failed on a file it had never created —
 * the opposite of what a starter is for.
 *
 * @param template - Which starter to render.
 * @param context - What the project contains. Both flags default to true, so
 * a caller that renders a template without inspecting a directory still gets
 * the complete starter.
 * @returns The YAML document, including the schema modeline.
 */
export function renderTemplate(
    template: InitTemplate,
    context: TemplateContext = {},
): string {
    const { hasReadme = true, hasLicense = true } = context;

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
                tsconfigPath: "./tsconfig.json"
                outputDir: "./dist"

${packageStage(hasReadme, hasLicense)}`;
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
${readmeStep(hasReadme)}`;
}

/**
 * The package starter's second stage, which copies the files that ship
 * alongside the code.
 *
 * Omitted entirely when there is nothing to copy: kist's own validator
 * rejects a stage with no steps, so an empty one would have turned a missing
 * README into an invalid configuration rather than a working one.
 *
 * @param hasReadme - Whether the project has a README.md.
 * @param hasLicense - Whether the project has a LICENSE.
 * @returns A YAML fragment, possibly empty.
 */
function packageStage(hasReadme: boolean, hasLicense: boolean): string {
    if (!hasReadme && !hasLicense) return "";

    const license = hasLicense
        ? `
          - name: copy-license
            action: FileCopyAction
            options:
                srcFile: "./LICENSE"
                destDir: "./dist"
`
        : "";

    return `
    - name: package
      description: Copy the files that ship with the package.
      dependsOn:
          - build
      steps:${readmeStep(hasReadme)}${license}`;
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
    /** Directory to write into. Defaults to the working directory. */
    directory?: string;
    /** Which starter to generate. Defaults to `"minimal"`. */
    template?: InitTemplate;
    /** Overwrite an existing file instead of refusing. */
    force?: boolean;
    /** Name of the file to write. Defaults to `"kist.yml"`. */
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
        renderTemplate(options.template ?? "minimal", {
            hasReadme: fs.existsSync(path.join(directory, "README.md")),
            hasLicense: fs.existsSync(path.join(directory, "LICENSE")),
        }),
        "utf-8",
    );

    return target;
}
