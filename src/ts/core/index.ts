// src/core/index.ts


// Export core classes and functions from the core directory

export { Pipeline } from './Pipeline';
export { Stage } from './Stage';
export { Step } from './Step';
export { BaseAction } from './Action';
export { LiveReloadServer } from './LiveReloadServer';
export { FileWatcher } from './FileWatcher';
export { PipelineManager } from './PipelineManager';

// export { StyleProcessingAction } from './StyleProcessingAction'; // Example of exporting a specific action, add others as needed

// Export utility functions or other core modules if applicable
// For example:
// export { someUtilityFunction } from './utils';

// Export registry for actions
// export { registerAction, getAction, listRegisteredActions } from '../actions/ActionRegistry';