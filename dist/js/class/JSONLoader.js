"use strict";
// class/JSONLoader.ts
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
// ============================================================================
// Import
// ============================================================================
const fs_1 = require("fs");
const path_1 = require("path");
// ============================================================================
// Classes
// ============================================================================
/**
 * Provides functionality to load and manipulate JSON data from files and
 * directories. This class can be used in scenarios where configurations,
 * data storage, or inter-process communication involves JSON files.
 */
class JSONLoader {
    /**
     * Asynchronously loads JSON data from a file and returns it as a typed
     * object. This method parses the JSON file content into a TypeScript
     * type or interface.
     *
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to an object containing the parsed JSON data.
     * @throws {Error} If the file cannot be read or the data cannot be parsed as JSON.
     */
    loadJSON(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs_1.promises.readFile(filePath, 'utf8');
                return JSON.parse(data);
            }
            catch (error) {
                console.error(`Error reading JSON file: ${filePath}`, error);
                throw error;
            }
        });
    }
    /**
     * Asynchronously loads all JSON files from a specified directory and
     * returns an array of typed objects. Useful for loading batches of
     * configuration files or similar datasets.
     *
     * @param dirPath The path to the directory containing JSON files.
     * @returns A promise that resolves to an array of objects containing the parsed JSON data.
     * @throws {Error} If the directory cannot be read or if there's an error parsing any of the files.
     */
    loadJSONFromDirectory(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = yield fs_1.promises.readdir(dirPath);
                const jsonFiles = files.filter(file => file.endsWith('.json'));
                const jsonData = yield Promise.all(jsonFiles.map(file => this.loadJSON(path_1.default.join(dirPath, file))));
                return jsonData;
            }
            catch (error) {
                console.error(`Error reading JSON files from directory: ${dirPath}`, error);
                throw error;
            }
        });
    }
    /**
     * Merges an array of objects into a single object. This method is
     * particularly useful when combining settings or configurations from
     * multiple JSON files into a single configuration object.
     *
     * @param objects An array of objects to merge.
     * @returns A single object containing all properties from the input objects.
     */
    mergeJSONObjects(objects) {
        return __awaiter(this, void 0, void 0, function* () {
            return objects.reduce((acc, obj) => (Object.assign(Object.assign({}, acc), obj)), {});
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = JSONLoader;
// ============================================================================
// Example
// ============================================================================
// import JSONLoader from './JSONLoader';
// const loader = new JSONLoader();
// const filePath = './config/settings.json';
// const dirPath = './configs';
// loader.loadJSON(filePath)
//     .then(config => console.log('Loaded JSON:', config))
//     .catch(error => console.error('Failed to load JSON file:', error));
// loader.loadJSONFromDirectory(dirPath)
//     .then(configs => {
//         console.log('Loaded multiple JSON configurations:', configs);
//         return loader.mergeJSONObjects(configs);
//     })
//     .then(mergedConfig => console.log('Merged Configuration:', mergedConfig))
//     .catch(error => console.error('Failed to load or merge configurations:', error));
