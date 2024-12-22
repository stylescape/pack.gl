/**
 * ConfigLoader is responsible for loading and parsing the `pack.yaml`
 * configuration file. This class reads the YAML configuration, validates it,
 * and converts it into a usable format for the pipeline.
 */

import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { ConfigInterface } from "../interface/ConfigInterface";

export class ConfigLoader {
    private configPath: string;

    /**
     * Constructs a ConfigLoader instance, setting up the path to the
     * configuration file.
     */
    constructor(configFileName: string = "pack.yaml") {
        this.configPath = path.resolve(process.cwd(), configFileName);
    }

    /**
     * Loads the configuration from the YAML file.
     * @returns ConfigInterface - The parsed configuration object containing
     * the pipeline stages, steps, and global options.
     * @throws Error if the configuration file cannot be read, parsed,
     * or validated.
     */
    public loadConfig(): ConfigInterface {
        try {
            // Read and parse the YAML configuration file
            const fileContents = fs.readFileSync(this.configPath, "utf8");
            const config = yaml.load(fileContents) as ConfigInterface;

            // Validate the configuration structure
            this.validateConfig(config);

            return config;
        } catch (error) {
            throw new Error(
                `Failed to load config from ${this.configPath}: ${(error as Error).message}`
            );
        }
    }

    /**
     * Validates the structure and content of the configuration object.
     * Ensures that stages have unique names, valid dependencies, and that
     * the configuration adheres to expected formats.
     * @param config - The configuration object to validate.
     * @throws Error if the configuration is invalid.
     */
    private validateConfig(config: ConfigInterface): void {
        if (!config || !Array.isArray(config.stages)) {
            throw new Error(
                "Invalid configuration format: 'stages' must be an array."
            );
        }

        const stageNames = new Set<string>();

        for (const stage of config.stages) {
            // Ensure each stage has a unique name
            if (stageNames.has(stage.name)) {
                throw new Error(`Duplicate stage name found: ${stage.name}`);
            }
            stageNames.add(stage.name);

            // Validate dependencies, ensuring they reference existing stages
            if (stage.dependsOn) {
                for (const dependency of stage.dependsOn) {
                    if (!stageNames.has(dependency)) {
                        throw new Error(
                            `Stage "${stage.name}" has an undefined dependency: "${dependency}".`
                        );
                    }
                }
            }

            // Validate steps within the stage
            this.validateSteps(stage.steps, stage.name);
        }
    }

    /**
     * Validates the steps within a stage, ensuring each step has the
     * necessary properties.
     * @param steps - The steps array to validate.
     * @param stageName - The name of the stage containing the steps.
     * @throws Error if any step is invalid.
     */
    private validateSteps(steps: any[], stageName: string): void {
        if (!Array.isArray(steps) || steps.length === 0) {
            throw new Error(
                `Stage "${stageName}" must contain at least one step.`
            );
        }

        const stepNames = new Set<string>();

        for (const step of steps) {
            if (!step.name || typeof step.name !== "string") {
                throw new Error(
                    `Each step in stage "${stageName}" must have a valid "name" property.`
                );
            }

            if (stepNames.has(step.name)) {
                throw new Error(
                    `Duplicate step name found in stage "${stageName}": "${step.name}".`
                );
            }
            stepNames.add(step.name);

            // Further validation for step actions and options could be added
            // here as needed
            if (!step.action || typeof step.action !== "string") {
                throw new Error(
                    `Step "${step.name}" in stage "${stageName}" must have a valid "action" property.`
                );
            }
        }
    }
}