// src/actions/LintAction.ts

import { StepAction } from './StepAction';

/**
 * Represents the 'lint' action, implementing the StepAction interface.
 */
export class LintAction implements StepAction {
    async execute(options: Record<string, any>): Promise<void> {
        console.log(`Executing lint with options: ${JSON.stringify(options)}`);
        // Simulate lint operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Lint completed.');
    }
}