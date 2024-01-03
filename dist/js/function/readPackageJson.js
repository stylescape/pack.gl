"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Assuming you're using ES6 module syntax
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
/**
 * Reads and parses the package.json file.
 * @param packageJsonPath - The path to the package.json file.
 * @returns The parsed package.json object.
 */
async function readPackageJson(packageJsonPath) {
    const fullPath = path_1.default.resolve(packageJsonPath);
    const fileContent = await promises_1.default.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent);
}
exports.default = readPackageJson;
