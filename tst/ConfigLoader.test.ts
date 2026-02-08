// ============================================================================
// Import
// ============================================================================

import * as fs from "fs/promises";
import * as path from "path";
import { ConfigLoader } from "../src/ts/core/config/ConfigLoader";

// ============================================================================
// Tests
// ============================================================================

describe("ConfigLoader", () => {
    const testDir = path.join(__dirname, "__test_config__");

    beforeEach(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(testDir, { recursive: true, force: true });
    });

    describe("config inheritance", () => {
        it("should load config without extends", async () => {
            const configPath = path.join(testDir, "kist.yml");
            await fs.writeFile(
                configPath,
                `
stages:
  - name: Build
    steps:
      - name: Step1
        action: TestAction
`,
            );

            // We need to mock the CLI args to point to our test config
            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", configPath];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                const config = await loader.loadConfig();

                expect(config.stages).toHaveLength(1);
                expect(config.stages[0].name).toBe("Build");
            } finally {
                process.argv = originalArgv;
            }
        });

        it("should inherit from single parent config", async () => {
            // Create parent config
            const parentPath = path.join(testDir, "kist.base.yml");
            await fs.writeFile(
                parentPath,
                `
options:
  mode: production

stages:
  - name: ParentStage
    steps:
      - name: ParentStep
        action: ParentAction
`,
            );

            // Create child config that extends parent
            const childPath = path.join(testDir, "kist.yml");
            await fs.writeFile(
                childPath,
                `
extends: ./kist.base.yml

options:
  logLevel: debug

stages:
  - name: ChildStage
    steps:
      - name: ChildStep
        action: ChildAction
`,
            );

            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", childPath];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                const config = await loader.loadConfig();

                // Options should be merged
                expect(config.options?.mode).toBe("production");
                expect(config.options?.logLevel).toBe("debug");

                // Stages should include both parent and child
                expect(config.stages).toHaveLength(2);
                expect(config.stages.map((s) => s.name)).toContain("ParentStage");
                expect(config.stages.map((s) => s.name)).toContain("ChildStage");
            } finally {
                process.argv = originalArgv;
            }
        });

        it("should override parent stage with same name", async () => {
            // Create parent config
            const parentPath = path.join(testDir, "kist.base.yml");
            await fs.writeFile(
                parentPath,
                `
stages:
  - name: Build
    steps:
      - name: OldStep
        action: OldAction
`,
            );

            // Create child config that overrides parent stage
            const childPath = path.join(testDir, "kist.yml");
            await fs.writeFile(
                childPath,
                `
extends: ./kist.base.yml

stages:
  - name: Build
    steps:
      - name: NewStep
        action: NewAction
`,
            );

            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", childPath];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                const config = await loader.loadConfig();

                // Should only have one Build stage (child replaces parent)
                expect(config.stages).toHaveLength(1);
                expect(config.stages[0].name).toBe("Build");
                expect(config.stages[0].steps?.[0].name).toBe("NewStep");
            } finally {
                process.argv = originalArgv;
            }
        });

        it("should support multiple inheritance", async () => {
            // Create first parent
            const parent1Path = path.join(testDir, "base.yml");
            await fs.writeFile(
                parent1Path,
                `
options:
  mode: production

stages:
  - name: Stage1
    steps:
      - name: Step1
        action: Action1
`,
            );

            // Create second parent
            const parent2Path = path.join(testDir, "defaults.yml");
            await fs.writeFile(
                parent2Path,
                `
options:
  logLevel: info

stages:
  - name: Stage2
    steps:
      - name: Step2
        action: Action2
`,
            );

            // Create child that extends both
            const childPath = path.join(testDir, "kist.yml");
            await fs.writeFile(
                childPath,
                `
extends:
  - ./base.yml
  - ./defaults.yml

stages:
  - name: Stage3
    steps:
      - name: Step3
        action: Action3
`,
            );

            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", childPath];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                const config = await loader.loadConfig();

                // Options should be merged from all configs
                expect(config.options?.mode).toBe("production");
                expect(config.options?.logLevel).toBe("info");

                // All stages should be present
                expect(config.stages).toHaveLength(3);
                const stageNames = config.stages.map((s) => s.name);
                expect(stageNames).toContain("Stage1");
                expect(stageNames).toContain("Stage2");
                expect(stageNames).toContain("Stage3");
            } finally {
                process.argv = originalArgv;
            }
        });

        it("should detect circular inheritance", async () => {
            // Create configs that reference each other
            const config1Path = path.join(testDir, "config1.yml");
            const config2Path = path.join(testDir, "config2.yml");

            await fs.writeFile(
                config1Path,
                `
extends: ./config2.yml
stages: []
`,
            );

            await fs.writeFile(
                config2Path,
                `
extends: ./config1.yml
stages: []
`,
            );

            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", config1Path];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                await expect(loader.loadConfig()).rejects.toThrow("Circular");
            } finally {
                process.argv = originalArgv;
            }
        });

        it("should handle nested extends (grandparent)", async () => {
            // Create grandparent
            const grandparentPath = path.join(testDir, "grandparent.yml");
            await fs.writeFile(
                grandparentPath,
                `
options:
  mode: base

stages:
  - name: GrandparentStage
    steps:
      - name: GrandparentStep
        action: GrandparentAction
`,
            );

            // Create parent that extends grandparent
            const parentPath = path.join(testDir, "parent.yml");
            await fs.writeFile(
                parentPath,
                `
extends: ./grandparent.yml

options:
  logLevel: info

stages:
  - name: ParentStage
    steps:
      - name: ParentStep
        action: ParentAction
`,
            );

            // Create child that extends parent
            const childPath = path.join(testDir, "kist.yml");
            await fs.writeFile(
                childPath,
                `
extends: ./parent.yml

stages:
  - name: ChildStage
    steps:
      - name: ChildStep
        action: ChildAction
`,
            );

            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", childPath];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                const config = await loader.loadConfig();

                // Options should be inherited through chain
                expect(config.options?.mode).toBe("base");
                expect(config.options?.logLevel).toBe("info");

                // All stages from chain should be present
                expect(config.stages).toHaveLength(3);
                const stageNames = config.stages.map((s) => s.name);
                expect(stageNames).toContain("GrandparentStage");
                expect(stageNames).toContain("ParentStage");
                expect(stageNames).toContain("ChildStage");
            } finally {
                process.argv = originalArgv;
            }
        });

        it("should handle missing extends file", async () => {
            const configPath = path.join(testDir, "kist.yml");
            await fs.writeFile(
                configPath,
                `
extends: ./nonexistent.yml
stages: []
`,
            );

            const originalArgv = process.argv;
            process.argv = ["node", "kist", "--config", configPath];

            try {
                const loader = new ConfigLoader();
                await loader.initialize();
                await expect(loader.loadConfig()).rejects.toThrow();
            } finally {
                process.argv = originalArgv;
            }
        });
    });
});
