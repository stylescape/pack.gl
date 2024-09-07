import ts from 'typescript';
var tsConfig = {
    target: ts.ScriptTarget.ES2015,
    lib: ["lib.es2015.d.ts", "lib.dom.d.ts"],
    module: ts.ModuleKind.CommonJS,
    resolveJsonModule: true,
    declaration: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    strict: true,
    skipLibCheck: true,
};
export default tsConfig;
//# sourceMappingURL=ts.config.js.map