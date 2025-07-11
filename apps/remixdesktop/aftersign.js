const { notarize } = require('@electron/notarize');
const { execFile, exec } = require('child_process');
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
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File',
        path.resolve(__dirname, 'sign-windows.ps1'),
        '-FilesToSign',
        ...filesToSign
      ],
      { stdio: 'inherit' },
      (error) => {
        if (error) {
          console.error('Signing script failed:', error);
          reject(error);
        } else {
          console.log('Windows signing completed successfully.');
          resolve();
        }
      }
    );
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

  if (process.platform === 'darwin') {
    await notarizeMac(context);
  } else if (process.platform === 'win32') {
    await signWindowsBinaries(appOutDir);
  } else {
    console.log('No signing needed for this platform.');
  }
};