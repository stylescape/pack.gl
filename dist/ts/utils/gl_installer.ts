// ============================================================================
// Import
// ============================================================================

import NpmCommandRunner from '../class/NpmCommandRunner.js';
import StylizedLogger from '../class/StylizedLogger.js';


// ============================================================================
// Constants
// ============================================================================

const runner = new NpmCommandRunner();
const logger = new StylizedLogger();


// ============================================================================
// Functions
// ============================================================================

/**
 * Installs a list of specified npm packages.
 * This function automates the process of installing multiple npm packages,
 * logging the progress and any errors that may occur during the installation.
 *
 * It uses the NpmCommandRunner class to run npm install commands for each package.
 * Each package is installed with the latest version and saved as a development dependency.
 */
async function gl_installer() {

    const packages = [
        'pack.gl',
        'unit.gl',
        'hue.gl',
        'page.gl',
        'grid.gl',
        'block.gl',
        'deep.gl',
        'icon.gl',
        'loop.gl',
    ];
    
    try {
        logger.header('Install .gl libraries');
        for (const pkg of packages) {
            logger.body(`Running npm install for ${pkg}...`);
            const output = await runner.runCommand(
                `install ${pkg}@latest --save-dev`
            );
            logger.body(output);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }

}


// ============================================================================
// Export
// ============================================================================

export default gl_installer;


// ============================================================================
// Example
// ============================================================================

// gl_installer().catch(error => console.error('Installation process encountered an error:', error));
