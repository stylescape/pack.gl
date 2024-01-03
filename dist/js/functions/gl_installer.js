"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var NpmCommandRunner_js_1 = __importDefault(require("../class/NpmCommandRunner.js"));
const runner = new NpmCommandRunner_js_1.default();
// runner.runCommand('install')
//     .then(output => console.log(output))
//     .catch(error => console.error(error));
async function gl_installer() {
    try {
        let output = "";
        console.log('Running npm install...');
        output = await runner.runCommand('install pack.gl@latest --save-dev');
        console.log(output);
        console.log('Running npm update...');
        output = await runner.runCommand('install unit.gl@latest --save-dev');
        console.log(output);
        // Add more npm commands as needed
        // output = await runner.runCommand('your-next-command');
        // console.log(output);
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
}
exports.default = gl_installer;
// runSampleCommands();
