import ts from "typescript";
declare const tsConfig: {
    target: ts.ScriptTarget;
    lib: string[];
    module: ts.ModuleKind;
    resolveJsonModule: boolean;
    declaration: boolean;
    allowSyntheticDefaultImports: boolean;
    esModuleInterop: boolean;
    forceConsistentCasingInFileNames: boolean;
    strict: boolean;
    skipLibCheck: boolean;
};
export default tsConfig;
