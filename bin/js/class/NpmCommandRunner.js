import { exec } from "child_process";
class NpmCommandRunner {
    runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(`npm ${command}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`stderr: ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
export default NpmCommandRunner;
//# sourceMappingURL=NpmCommandRunner.js.map