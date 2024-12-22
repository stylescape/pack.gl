// ============================================================================
// Import
// ============================================================================

import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { ConfigInterface } from "../interface/ConfigInterface";


// ============================================================================
// Class
// ============================================================================

/**
 * ConfigLoader is responsible for loading and parsing configuration files
 * (`pack.yaml` or `pack.yml`). It validates the configuration structure
 * and provides it in a usable format for the pipeline.
 */
export class ConfigLoader {


    // Parameters
    // ========================================================================

    private configPath: string | null = null;


    // Constructor
    // ========================================================================

    /**
     * Constructs a ConfigLoader instance, searching for `pack.yaml` or
     * `pack.yml` in the current working directory.
     * 
     * @param filenames - Optional list of configuration filenames to search for.
     * Defaults to `["pack.yaml", "pack.yml"]`.
     */
    constructor(
        private filenames: string[] = [
            "pack.yaml",
            "pack.yml"
        ]
    ) {

        for (const filename of this.filenames) {
            const resolvedPath = path.resolve(process.cwd(), filename);
            if (fs.existsSync(resolvedPath)) {
                this.configPath = resolvedPath;
                console.log(
                    `[ConfigLoader] Found configuration file: ${resolvedPath}`
                );
                break;
            }
        }

        if (!this.configPath) {
            console.warn(
                "[ConfigLoader] No configuration file found. Proceeding without `pack.yaml` or `pack.yml`."
            );
        }
    }

    // Methods
    // ========================================================================

    /**
     * Loads the configuration from the YAML file if it exists.
     * 
     * @returns Parsed configuration object or `null` if no config file is found.
     */
    public loadConfig(): ConfigInterface | null {
        if (!this.configPath) {
            return null; // No configuration file found
        }

        try {
            // Read and parse the YAML configuration file
            const fileContents = fs.readFileSync(this.configPath, "utf8");
            const config = yaml.load(fileContents) as ConfigInterface;

            // Validate the configuration structure
            this.validateConfig(config);

            return config;
        } catch (error) {
            throw new Error(
                `[ConfigLoader] Failed to load config from ${this.configPath}: ${
                    (error as Error).message
                }`
            );
        }
    }

    /**
     * Validates the structure and content of the configuration object.
     * 
     * @param config - The configuration object to validate.
     * @throws Error if the configuration is invalid.
     */
    private validateConfig(
        config: ConfigInterface
    ): void {
        if (!config || !Array.isArray(config.stages)) {
            throw new Error(
                "[ConfigLoader] Invalid configuration format: 'stages' must be an array."
            );
        }

        const stageNames = new Set<string>();

        for (const stage of config.stages) {
            this.validateStage(stage, stageNames);
        }
    }


    /**
     * Validates an individual stage in the configuration.
     * 
     * @param stage - The stage object to validate.
     * @param stageNames - A set to track unique stage names.
     * @throws Error if the stage is invalid.
     */
    private validateStage(
        stage: any,
        stageNames: Set<string>
    ): void {
        if (!stage.name || typeof stage.name !== "string") {
            throw new Error(
                "[ConfigLoader] Each stage must have a valid 'name' property."
            );
        }

        if (stageNames.has(stage.name)) {
            throw new Error(`[ConfigLoader] Duplicate stage name found: "${stage.name}".`);
        }
        stageNames.add(stage.name);

        if (stage.dependsOn) {
            this.validateDependencies(stage.dependsOn, stageNames, stage.name);
        }

        this.validateSteps(stage.steps, stage.name);
    }

    /**
     * Validates dependencies for a stage.
     * 
     * @param dependencies - The list of dependencies to validate.
     * @param stageNames - The set of valid stage names.
     * @param stageName - The name of the current stage.
     * @throws Error if any dependency is invalid.
     */
    private validateDependencies(
        dependencies: string[],
        stageNames: Set<string>,
        stageName: string
    ): void {
        for (const dependency of dependencies) {
            if (!stageNames.has(dependency)) {
                throw new Error(
                    `[ConfigLoader] Stage "${stageName}" has an undefined dependency: "${dependency}".`
                );
            }
        }
    }


    /**
     * Validates the steps within a stage.
     * 
     * @param steps - The steps array to validate.
     * @param stageName - The name of the stage containing the steps.
     * @throws Error if any step is invalid.
     */
    private validateSteps(steps: any[], stageName: string): void {
        if (!Array.isArray(steps) || steps.length === 0) {
            throw new Error(`[ConfigLoader] Stage "${stageName}" must contain at least one step.`);
        }

        const stepNames = new Set<string>();

        for (const step of steps) {
            if (!step.name || typeof step.name !== "string") {
                throw new Error(`[ConfigLoader] Each step in stage "${stageName}" must have a valid 'name' property.`);
            }

            if (stepNames.has(step.name)) {
                throw new Error(
                    `[ConfigLoader] Duplicate step name found in stage "${stageName}": "${step.name}".`
                );
            }
            stepNames.add(step.name);

            if (!step.action || typeof step.action !== "string") {
                throw new Error(
                    `[ConfigLoader] Step "${step.name}" in stage "${stageName}" must have a valid 'action' property.`
                );
            }
        }
    }
}