"use strict";
// ============================================================================
// Import
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const NpmCommandRunner_js_1 = require("../class/NpmCommandRunner.js");
const StylizedLogger_js_1 = require("../class/StylizedLogger.js");
// ============================================================================
// Constants
// ============================================================================
const runner = new NpmCommandRunner_js_1.default();
const logger = new StylizedLogger_js_1.default();
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
function gl_installer() {
    return __awaiter(this, void 0, void 0, function* () {
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
                const output = yield runner.runCommand(`install ${pkg}@latest --save-dev`);
                logger.body(output);
            }
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
// ============================================================================
// Export
// ============================================================================
exports.default = gl_installer;
// ============================================================================
// Example
// ============================================================================
// gl_installer().catch(error => console.error('Installation process encountered an error:', error));
