const fs = require('fs');
const os = require('os');
const path = require('path');
const child_process = require('child_process');

// node-abi is still shipping the wrong data
// correct this issue manually for now
const prebuildPkgPath = path.dirname(require.resolve('prebuild'));
const nodeAbiPkgPath = path.dirname(require.resolve('node-abi'));
const prebuildPath = path.resolve(prebuildPkgPath, 'bin.js');
// const abiRegistryJsonPath = path.resolve(nodeAbiPkgPath, 'abi_registry.json');
// fs.copyFileSync(path.resolve(__dirname, 'abi_registry.json'), abiRegistryJsonPath);

if (os.platform() === 'win32') {
  process.exit(0);
}

const cwd = path.resolve(__dirname, '../');


/** 
 * --------------- Electron Build ---------------
 */


 var electronBuildTargets = [...process.argv];

 electronBuildTargets.shift();
 electronBuildTargets.shift();

const electronBuildCmd = [
  prebuildPath,
  '-r',
  'electron',
  ...electronBuildTargets,
]

console.log('Building for Electron:');
console.log(electronBuildCmd.join(' '));

try {
  var result = child_process.spawnSync(process.execPath, electronBuildCmd, {
    cwd: cwd,
    stdio: ['inherit', 'inherit', 'inherit']
  });
  console.log('electronBuild Result ', result.status, result.signal, result.error);
  if (result.status != 0) {
    process.exit(1);
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}