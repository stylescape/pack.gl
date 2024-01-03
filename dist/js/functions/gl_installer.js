"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NpmCommandRunner_js_1 = __importDefault(require("../class/NpmCommandRunner.js"));
const runner = new NpmCommandRunner_js_1.default();
// runner.runCommand('install')
//     .then(output => console.log(output))
//     .catch(error => console.error(error));
function gl_installer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let output = "";
            console.log('Running npm install...');
            output = yield runner.runCommand('install pack.gl@latest --save-dev');
            console.log(output);
            console.log('Running npm update...');
            output = yield runner.runCommand('install unit.gl@latest --save-dev');
            console.log(output);
            // Add more npm commands as needed
            // output = await runner.runCommand('your-next-command');
            // console.log(output);
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
exports.default = gl_installer;
// runSampleCommands();
