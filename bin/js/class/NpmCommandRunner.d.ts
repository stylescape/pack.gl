declare class NpmCommandRunner {
    runCommand(command: string): Promise<string>;
}
export default NpmCommandRunner;
