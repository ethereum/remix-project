const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Detect configuration argument (default to "development" if none is provided)
const configArg = process.argv[2] || "development";

// Path to nx.json
const nxConfigPath = path.join(__dirname, "nx.json");

if (!fs.existsSync(nxConfigPath)) {
  console.error("Error: nx.json file not found.");
  process.exit(1);
}

// Read nx.json
const nxConfig = JSON.parse(fs.readFileSync(nxConfigPath, "utf8"));

// Get default project
const defaultProject = nxConfig.defaultProject;

if (!defaultProject) {
  console.error("Error: No default project found in nx.json.");
  process.exit(1);
}

// Path to project.json of the default project
const projectConfigPath = path.join(__dirname, "apps", defaultProject, "project.json");

if (!fs.existsSync(projectConfigPath)) {
  console.error(`Error: project.json not found for default project (${defaultProject}).`);
  process.exit(1);
}

// Read project.json
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, "utf8"));

// Get implicit dependencies
const implicitDependencies = ["doc-gen", "doc-viewer", "contract-verification", "vyper", "solhint", "walletconnect", "circuit-compiler", "learneth", "quick-dapp", "remix-dapp", "noir-compiler", "remixd"];

// Construct the `nx run-many` command
const projects = [ defaultProject, ...implicitDependencies].join(",");
const command = `yarn nx run-many --target=build --projects=${projects} --configuration=${configArg} --parallel --skip-nx-cache --max-parallel=20`;

console.log("Generated command:", command);

// Optionally, execute the command
try {
  //execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error("Error executing command:", error.message);
}