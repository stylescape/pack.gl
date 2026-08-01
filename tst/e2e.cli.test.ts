// ============================================================================
// CLI End-to-End Tests
// ============================================================================

// Runs the BUILT CLI (dist/js/cli.js) against a throwaway fixture project and
// asserts on real artifacts and exit codes — no mocks. The suite is skipped
// when the build output is missing (run `npm run build` first); CI always
// builds before testing, so there it always runs.

import { spawnSync } from "child_process";
import {
    existsSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const cliPath = resolve(__dirname, "../dist/js/cli.js");
const describeE2e = existsSync(cliPath) ? describe : describe.skip;

describeE2e("CLI end-to-end", () => {
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-e2e-"));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    /** Writes `kist.yml` into the fixture project and runs the built CLI. */
    function runKist(config: string): {
        status: number | null;
        stdout: string;
        stderr: string;
    } {
        writeFileSync(join(root, "kist.yml"), config, "utf-8");
        const result = spawnSync(process.execPath, [cliPath], {
            cwd: root,
            encoding: "utf-8",
            timeout: 60_000,
        });
        return {
            status: result.status,
            stdout: result.stdout ?? "",
            stderr: result.stderr ?? "",
        };
    }

    it("should run a pipeline and produce the expected artifact", () => {
        writeFileSync(join(root, "input.txt"), "hello kist\n", "utf-8");

        const result = runKist(
            [
                "stages:",
                "    - name: Copy",
                "      steps:",
                "          - name: CopyInput",
                "            action: FileCopyAction",
                "            options:",
                '                srcFile: "./input.txt"',
                '                destDir: "./out"',
                "",
            ].join("\n"),
        );

        expect(result.status).toBe(0);
        expect(readFileSync(join(root, "out", "input.txt"), "utf-8")).toBe(
            "hello kist\n",
        );
    });

    it("should exit non-zero when an action fails", () => {
        const result = runKist(
            [
                "stages:",
                "    - name: Broken",
                "      steps:",
                "          - name: CopyMissing",
                "            action: FileCopyAction",
                "            options:",
                '                srcFile: "./does-not-exist.txt"',
                '                destDir: "./out"',
                "",
            ].join("\n"),
        );

        expect(result.status).toBe(1);
        // The destination directory may be created before the copy fails,
        // but no artifact must be produced.
        expect(existsSync(join(root, "out", "does-not-exist.txt"))).toBe(
            false,
        );
    });

    it("should exit non-zero for an unknown action", () => {
        const result = runKist(
            [
                "stages:",
                "    - name: Ghost",
                "      steps:",
                "          - name: Nothing",
                "            action: GhostAction",
                "",
            ].join("\n"),
        );

        expect(result.status).toBe(1);
    });

    it("should exit non-zero for a dependency on an unknown stage", () => {
        const result = runKist(
            [
                "stages:",
                "    - name: Orphan",
                "      dependsOn:",
                "          - Ghost",
                "      steps:",
                "          - name: Nothing",
                "            action: FileCopyAction",
                "            options:",
                '                srcFile: "./x"',
                '                destDir: "./y"',
                "",
            ].join("\n"),
        );

        expect(result.status).toBe(1);
    });
});
