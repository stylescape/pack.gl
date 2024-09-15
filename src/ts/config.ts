/**
 * Handles loading and parsing of the `pack.yaml` configuration file.
 * This module reads the YAML configuration, validates it, and converts it into a usable format for the pipeline.
 */

import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml'; // Ensure you have the js-yaml package installed
import { Config } from './types';

/**
 * Loads the configuration from a YAML file named `pack.yaml` located in the current working directory.
 * @returns Config - The parsed configuration object containing the pipeline stages, steps, and global options.
 * @throws Error if the configuration file cannot be read or parsed.
 */
export function loadConfig(): Config {

    const configPath = path.resolve(process.cwd(), 'pack.yaml');

    try {
        // Read and parse the YAML configuration file
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents) as Config;

        // Validate the configuration structure
        if (!config || !Array.isArray(config.stages)) {
            throw new Error('Invalid configuration format: Stages must be an array.');
        }

        // Ensure that each stage has unique names and validate dependencies
        const stageNames = new Set<string>();
        for (const stage of config.stages) {
            if (stageNames.has(stage.name)) {
                throw new Error(`Duplicate stage name found: ${stage.name}`);
            }
            stageNames.add(stage.name);

            if (stage.dependsOn) {
                for (const dependency of stage.dependsOn) {
                    if (!stageNames.has(dependency)) {
                        throw new Error(`Stage ${stage.name} has an undefined dependency: ${dependency}`);
                    }
                }
            }
        }

        return config;
    } catch (error) {
        throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
    }
}