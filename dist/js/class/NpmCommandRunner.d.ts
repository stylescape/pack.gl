declare class NpmCommandRunner {
    /**
     * Executes an npm command.
     * @param command The npm command to run.
     * @returns A promise that resolves with the command output or rejects with an error.
     */
    runCommand(command: string): Promise<string>;
}
export default NpmCommandRunner;
