const { notarize } = require('@electron/notarize');
const { spawn, exec } = require('child_process');
const path = require('path');

// Windows signing function
function signWindowsBinaries(appOutDir) {
  const filesToSign = [
    path.join(appOutDir, 'Remix-Desktop.exe'),
    path.join(appOutDir, 'resources', 'app.asar.unpacked', 'node_modules', 'node-pty', 'build', 'Release', 'winpty-agent.exe'),
    path.join(appOutDir, 'resources', 'app.asar.unpacked', 'node_modules', '@vscode', 'ripgrep', 'bin', 'rg.exe'),
  ];

  console.log('Signing the following Windows files:', filesToSign);

  return new Promise((resolve, reject) => {
    const child = spawn(
      'bash',
      [
        path.resolve(__dirname, 'sign-windows.sh'),
        filesToSign.join(';')
      ],
      { stdio: 'inherit' }
    );

    child.on('exit', (code) => {
      if (code === 0) {
        console.log('Windows signing completed successfully.');
        resolve();
      } else {
        reject(new Error(`Signing script exited with code ${code}`));
      }
    });
  });
}

// macOS notarization function
async function notarizeMac(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization: not darwin or CIRCLE_BRANCH not set.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  async function execShellCommand(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error: ${error.message}`));
          return;
        }
        if (stderr) {
          reject(new Error(`Stderr: ${stderr}`));
          return;
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
      });
    });
  }

  async function checkStapleStatus() {
    try {
      console.log(`xcrun stapler validate "${appPath}"`);
      await execShellCommand(`xcrun stapler validate "${appPath}"`);
      console.log('App is already stapled.');
      return true;
    } catch (error) {
      console.log(`App is not stapled: ${error.message}`);
      return false;
    }
  }

  async function runNotarize() {
    console.log('Notarizing app...');
    await notarize({
      appBundleId: 'org.ethereum.remix-ide',
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log('Stapling...');
    await execShellCommand(`xcrun stapler staple "${appPath}"`);
  }

  if (!(await checkStapleStatus())) {
    await runNotarize();
    await checkStapleStatus();
  }
}

// Main export
exports.default = async function afterSign(context) {
  const { appOutDir } = context;

  // Skip signing for local builds
  const isCI = process.env.CI || 
               process.env.GITHUB_ACTIONS || 
               process.env.CIRCLECI || 
               process.env.APPVEYOR || 
               process.env.TRAVIS;
  
  if (!isCI || process.env.DO_NOT_NOTARIZE == 'true' || process.env.DO_NOT_SIGN == 'true') {
    console.log('Skipping signing: local build detected (no CI environment).');
    return;
  }

  if (process.platform === 'darwin') {
    await notarizeMac(context);
  } else if (process.platform === 'win32') {
    await signWindowsBinaries(appOutDir);
  } else {
    console.log('No signing needed for this platform.');
  }
};