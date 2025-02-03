declare function readPackageJson(packageJsonPath: string): Promise<Record<string, unknown>>;
export default readPackageJson;
