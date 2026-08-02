// ============================================================================
// Init Command Tests
// ============================================================================

import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { load as loadYaml } from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";
import {
    INIT_TEMPLATES,
    renderTemplate,
    writeInitialConfig,
} from "../src/ts/cli/InitCommand";
import { KIST_SCHEMA } from "../src/ts/config/kistSchema";
import { SchemaValidator } from "../src/ts/core/validation/SchemaValidator";
import { CLIError } from "../src/ts/errors/index";
import { silenceConsole } from "./helpers/silence";

describe("InitCommand", () => {
    silenceConsole();
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-init-"));
        SchemaValidator.reset();
    });

    afterEach(() => rmSync(root, { recursive: true, force: true }));

    // ------------------------------------------------------------------------
    // renderTemplate
    // ------------------------------------------------------------------------

    describe("renderTemplate", () => {
        it.each([...INIT_TEMPLATES])(
            "should render %s as valid YAML that satisfies the schema",
            (template) => {
                const parsed = loadYaml(renderTemplate(template));

                // A starter file that its own validator rejects would be the
                // worst possible first impression, so check it here.
                expect(() =>
                    new SchemaValidator().validate(parsed),
                ).not.toThrow();
            },
        );

        it.each([...INIT_TEMPLATES])(
            "should point %s at the schema for both editor families",
            (template) => {
                const rendered = renderTemplate(template);

                expect(rendered).toContain(
                    `# yaml-language-server: $schema=${KIST_SCHEMA.$id}`,
                );
                expect(rendered).toContain(`# $schema: ${KIST_SCHEMA.$id}`);
            },
        );

        it("should default to the minimal template", () => {
            expect(renderTemplate("minimal")).toContain("A minimal kist");
        });

        it("should enable caching in the package template", () => {
            const rendered = renderTemplate("package");

            expect(rendered).toContain("cache:");
            expect(rendered).toContain("inputs:");
            expect(rendered).toContain("outputs:");
        });
    });

    // ------------------------------------------------------------------------
    // writeInitialConfig
    // ------------------------------------------------------------------------

    describe("writeInitialConfig", () => {
        it("should write kist.yml into the given directory", () => {
            const written = writeInitialConfig({ directory: root });

            expect(written).toBe(join(root, "kist.yml"));
            expect(readFileSync(written, "utf-8")).toContain("stages:");
        });

        it("should create the directory when it does not exist", () => {
            const nested = join(root, "a", "b");
            writeInitialConfig({ directory: nested });

            expect(existsSync(join(nested, "kist.yml"))).toBe(true);
        });

        it("should honour the requested template", () => {
            const written = writeInitialConfig({
                directory: root,
                template: "package",
            });

            expect(readFileSync(written, "utf-8")).toContain(
                "TypeScriptCompilerAction",
            );
        });

        it("should honour a custom filename", () => {
            const written = writeInitialConfig({
                directory: root,
                filename: "kist.yaml",
            });

            expect(written).toBe(join(root, "kist.yaml"));
        });

        it("should refuse to overwrite an existing file", () => {
            writeInitialConfig({ directory: root });

            expect(() => writeInitialConfig({ directory: root })).toThrow(
                CLIError,
            );
            expect(() => writeInitialConfig({ directory: root })).toThrow(
                /Pass --force to overwrite it/,
            );
        });

        it("should overwrite when forced", () => {
            writeInitialConfig({ directory: root });

            const written = writeInitialConfig({
                directory: root,
                template: "package",
                force: true,
            });

            expect(readFileSync(written, "utf-8")).toContain(
                "TypeScriptCompilerAction",
            );
        });

        it("should default to the current working directory", () => {
            const original = process.cwd();
            process.chdir(root);
            try {
                // Compared against process.cwd() rather than `root`: macOS
                // reports /private/var where the temp path says /var.
                expect(writeInitialConfig({})).toBe(
                    join(process.cwd(), "kist.yml"),
                );
            } finally {
                process.chdir(original);
            }
        });
    });
});
