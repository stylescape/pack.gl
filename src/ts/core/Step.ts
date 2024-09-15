// src/Step.ts

import { Step as StepType } from './types';

/**
 * Represents a single step in a stage, encapsulating its execution logic.
 */
export class Step {
    private name: string;
    private action: string;
    private options?: Record<string, any>;

    /**
     * Constructs a Step instance with the given step definition.
     * @param step - The step definition containing name, action, and options.
     */
    constructor(step: StepType) {
        this.name = step.name;
        this.action = step.action;
        this.options = step.options;
    }

    /**
     * Executes the step, handling the action specified and managing errors.
     * Includes logging of the start and completion of each step.
     */
    async execute() {
        console.log(`Running step: ${this.name}`);
        try {
            // Simulate the task execution logic
            switch (this.action) {
                case 'build':
                    await this.build();
                    break;
                case 'test':
                    await this.test();
                    break;
                case 'lint':
                    await this.lint();
                    break;
                case 'package':
                    await this.package();
                    break;
                case 'deploy':
                    await this.deploy();
                    break;
                case 'custom':
                    await this.customAction();
                    break;
                default:
                    throw new Error(`Unknown action: ${this.action}`);
            }
            console.log(`Step ${this.name} completed successfully.`);
        } catch (error) {
            console.error(`Error executing step ${this.name}:`, error);
        }
    }

    /**
     * Handles the 'build' action.
     * Simulates a build process with optional configurations.
     */
    private async build() {
        console.log(`Building with options: ${JSON.stringify(this.options)}`);
        // Simulate build operation
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Handles the 'test' action.
     * Simulates a testing process with optional configurations.
     */
    private async test() {
        console.log(`Testing with options: ${JSON.stringify(this.options)}`);
        // Simulate test operation
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Handles the 'lint' action.
     * Simulates a linting process with optional configurations.
     */
    private async lint() {
        console.log(`Linting with options: ${JSON.stringify(this.options)}`);
        // Simulate lint operation
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Handles the 'package' action.
     * Simulates a packaging process with optional configurations.
     */
    private async package() {
        console.log(`Packaging with options: ${JSON.stringify(this.options)}`);
        // Simulate package operation
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Handles the 'deploy' action.
     * Simulates a deployment process with optional configurations.
     */
    private async deploy() {
        console.log(`Deploying with options: ${JSON.stringify(this.options)}`);
        // Simulate deploy operation
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Handles a 'custom' action.
     * Allows for user-defined behavior.
     */
    private async customAction() {
        console.log(`Executing custom action with options: ${JSON.stringify(this.options)}`);
        // Simulate custom action
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}