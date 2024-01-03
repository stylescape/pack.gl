/**
 * Installs a list of specified npm packages.
 * This function automates the process of installing multiple npm packages,
 * logging the progress and any errors that may occur during the installation.
 *
 * It uses the NpmCommandRunner class to run npm install commands for each package.
 * Each package is installed with the latest version and saved as a development dependency.
 */
declare function gl_installer(): Promise<void>;
export default gl_installer;
