// ============================================================================
// Import
// ============================================================================

import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { ConfigInterface } from "../../interface/ConfigInterface";
import { AbstractProcess } from "../abstract/AbstractProcess";


// ============================================================================
// Class
// ============================================================================

/**
 * ConfigLoader is responsible for loading and parsing configuration files
 * (`pack.yaml` or `pack.yml` by deault). It validates the configuration
 * structure and provides it in a usable format for the pipeline.
 * Extends `AbstractProcess` for consistent logging.
 */
export class ConfigLoader extends AbstractProcess {


    // Parameters
    // ========================================================================

    private configPath: string | null = null;


    // Constructor
    // ========================================================================

    /**
     * Constructs a ConfigLoader instance.
     * Searches for `pack.yaml` or `pack.yml` in the working directory
     * unless a custom path is provided.
     *
     * @param configPath - Optional custom configuration file path.
     */
    constructor(
        configPath?: string
    ) {
        super();
        this.configPath = null;
        this.logInfo("ConfigLoader initialized.");
    }
    
    public async initialize(configPath?: string): Promise<void> {
        const possibleFiles = configPath ? [configPath] : ["pack.yaml", "pack.yml"];
        for (const fileName of possibleFiles) {
            const resolvedPath = path.resolve(process.cwd(), fileName);
            try {
                await fs.promises.access(resolvedPath, fs.constants.F_OK);
                this.configPath = resolvedPath;
                this.logInfo(`Found configuration file: ${resolvedPath}`);
                break;
            } catch {
                continue; // Try the next file
            }
        }
    
        if (!this.configPath) {
            this.logWarn("No configuration file found. Proceeding with default settings.");
        }
    }

    // Methods
    // ========================================================================

    /**
     * Loads and validates the configuration file.
     * 
     * @returns Parsed and validated configuration object.
     * @throws Error if the configuration file cannot be read or validated.
     */
    public async loadConfig(): Promise<ConfigInterface> {
        if (!this.configPath) {
            this.logWarn("No configuration file found. Using default configuration.");
            return { stages: [] };
        }

        try {
            const fileContents = await fs.promises.readFile(this.configPath, "utf8");
            const config = yaml.load(fileContents) as ConfigInterface;

            if (!Array.isArray(config.stages)) {
                throw new Error("Invalid configuration format: 'stages' must be an array.");
            }

            this.validateConfig(config);
            this.logInfo(`Successfully loaded configuration from ${this.configPath}`);
            return config;
        } catch (error) {
            this.logError("Failed to load configuration.", error);
            throw new Error(`Failed to load configuration: ${(error as Error).message}`);
        }
    }


    // /**
    //  * Loads the configuration from the YAML file.
    //  *
    //  * @returns Parsed configuration or default empty configuration.
    //  * @throws {Error} Throws an error if parsing or validation fails.
    //  */
    // public async loadConfig(): Promise<ConfigInterface> {
    //     if (!this.configPath) {
    //         this.logWarn("No configuration file found. Using empty configuration.");
    //         return { stages: [] }; // Default fallback configuration
    //     }

    //     try {
    //         // Read and parse the YAML configuration file
    //         const fileContents = await fs.promises.readFile(
    //             this.configPath,
    //             "utf8"
    //         );
    //         const config = yaml.load(fileContents) as ConfigInterface;

    //         if (
    //             !config || 
    //             typeof config !== "object" || 
    //             !Array.isArray(config.stages)
    //         ) {
    //             throw new Error(
    //                 `Invalid configuration format: 'stages' must be an array. 
    //                 Loaded config: ${JSON.stringify(config, null, 2)}`
    //             );
    //         }

    //         // Validate the configuration structure
    //         this.validateConfig(config);
    //         this.logInfo(
    //             `Successfully loaded configuration from ${this.configPath}`
    //         );
    //         return config;
    //     } catch (error) {
    //         const errorMsg = `
    //             Failed to load configuration from ${this.configPath}: 
    //             ${(error as Error).message}
    //         `;
    //         this.logError(errorMsg, error);
    //         throw new Error(errorMsg);
    //     }
    // }

    /**
     * Validates the structure and content of the configuration object.
     * 
     * @param config - The configuration object to validate.
     * @throws Error if the configuration is invalid.
     */
    private validateConfig(config: ConfigInterface): void {
        if (!config || typeof config !== "object" || !Array.isArray(config.stages)) {
            throw new Error(
                `Invalid configuration format: 'stages' must be an array. Found: ${JSON.stringify(config, null, 2)}`
            );
        }

        const stageNames = new Set<string>();

        for (const stage of config.stages) {
            this.validateStage(stage, stageNames);
        }
    }

    // /**
    //  * Validates the configuration structure.
    //  * 
    //  * @param config - The configuration object to validate.
    //  */
    // private validateConfig(config: ConfigInterface): void {
    //     const stageNames = new Set<string>();
    //     for (const stage of config.stages) {
    //         if (!stage.name || typeof stage.name !== "string") {
    //             throw new Error("Each stage must have a valid 'name' property.");
    //         }

    //         if (stageNames.has(stage.name)) {
    //             throw new Error(`Duplicate stage name found: "${stage.name}".`);
    //         }
    //         stageNames.add(stage.name);

    //         if (stage.dependsOn) {
    //             stage.dependsOn.forEach((dependency) => {
    //                 if (!stageNames.has(dependency)) {
    //                     throw new Error(`Stage "${stage.name}" has an undefined dependency: "${dependency}".`);
    //                 }
    //             });
    //         }

    //         if (!Array.isArray(stage.steps)) {
    //             throw new Error(`Stage "${stage.name}" must contain an array of steps.`);
    //         }
    //     }
    // }

    /**
     * Validates an individual stage in the configuration.
     * 
     * @param stage - The stage object to validate.
     * @param stageNames - A set to track unique stage names.
     * @throws Error if the stage is invalid.
     */
    private validateStage(stage: any, stageNames: Set<string>): void {
        if (!stage.name || typeof stage.name !== "string") {
            throw new Error("Each stage must have a valid 'name' property.");
        }

        if (stageNames.has(stage.name)) {
            throw new Error(`Duplicate stage name found: "${stage.name}".`);
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
    private validateDependencies(dependencies: string[], stageNames: Set<string>, stageName: string): void {
        for (const dependency of dependencies) {
            if (!stageNames.has(dependency)) {
                throw new Error(`Stage "${stageName}" has an undefined dependency: "${dependency}".`);
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
            throw new Error(`Stage "${stageName}" must contain at least one step.`);
        }

        const stepNames = new Set<string>();

        for (const step of steps) {
            if (!step.name || typeof step.name !== "string") {
                throw new Error(`Each step in stage "${stageName}" must have a valid 'name' property.`);
            }

            if (stepNames.has(step.name)) {
                throw new Error(`Duplicate step name found in stage "${stageName}": "${step.name}".`);
            }
            stepNames.add(step.name);

            if (!step.action || typeof step.action !== "string") {
                throw new Error(`Step "${step.name}" in stage "${stageName}" must have a valid 'action' property.`);
            }
        }
    }
}