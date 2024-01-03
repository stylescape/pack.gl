

import NpmCommandRunner from '../class/NpmCommandRunner.js';


const runner = new NpmCommandRunner();

// runner.runCommand('install')
//     .then(output => console.log(output))
//     .catch(error => console.error(error));


async function gl_installer() {
    try {

        let output: string = ""

        console.log('Running npm install...');
        output = await runner.runCommand('install pack.gl@latest --save-dev');
        console.log(output);

        console.log('Running npm update...');
        output = await runner.runCommand('install unit.gl@latest --save-dev');
        console.log(output);

        // Add more npm commands as needed
        // output = await runner.runCommand('your-next-command');
        // console.log(output);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}


export default gl_installer;
// runSampleCommands();

