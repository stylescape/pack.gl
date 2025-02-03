import { RunnerOptions } from "fantasticon";
declare class FontGenerator {
    private config;
    private static defaultConfig;
    constructor(customConfig?: Partial<RunnerOptions>);
    generateFonts(sourceDirectory: string, outputDiectory: string, options?: {}): Promise<void>;
}
export default FontGenerator;
