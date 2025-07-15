const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

exports.default = async function afterbuild(context) {
  const isCI = process.env.CIRCLE_BRANCH || process.env.GITHUB_REF;
  if (!isCI) {
    return;
  }

  console.log('AFTER BUILD', context);

  // Handle macOS DMG notarization
  if (process.platform === 'darwin') {
    await handleMacOSNotarization(context);
  }
  
  // Handle Windows installer signing
  if (process.platform === 'win32') {
    await handleWindowsSigning(context);
  }
};

async function handleMacOSNotarization(context) {
  const artifactPaths = context.artifactPaths;
  const newDmgs = artifactPaths.filter((dmg) => dmg.endsWith('.dmg')).map((dmg) => dmg);

  let existingDmgs = [];
  try {
    const data = fs.readFileSync('dmgs.json', 'utf8');
    const parsedData = JSON.parse(data);
    existingDmgs = parsedData.dmgs || [];
  } catch (error) {
    console.log('No existing dmgs.json or error reading file, creating new one.');
  }

  const combinedDmgs = [...new Set([...existingDmgs, ...newDmgs])];
  fs.writeFileSync('dmgs.json', JSON.stringify({ dmgs: combinedDmgs }, null, 2));
}

async function handleWindowsSigning(context) {
  try {
    // Get version from package.json
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version;
    
    // Construct the installer path
    const installerPath = path.join(__dirname, 'release', `Remix-Desktop-Setup-${version}.exe`);
    
    if (!fs.existsSync(installerPath)) {
      console.log(`Windows installer not found at ${installerPath}, skipping signing`);
      return;
    }

    console.log(`Signing Windows installer: ${installerPath}`);
    
    // Check if we have the required environment variables for signing
    const requiredEnvVars = ['SM_API_KEY', 'SM_CLIENT_CERT_FILE_B64', 'SM_CODE_SIGNING_CERT_SHA1_HASH'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.log(`Missing required environment variables for signing: ${missingEnvVars.join(', ')}`);
      console.log('Skipping Windows installer signing');
      return;
    }

    // Use the existing sign-windows.sh script
    await signWithScript(installerPath);
    
    console.log(`Successfully signed Windows installer: ${installerPath}`);
    
  } catch (error) {
    console.error('Error signing Windows installer:', error);
    // Don't fail the build, just log the error
  }
}

function signWithScript(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'bash',
      [
        path.resolve(__dirname, 'sign-windows.sh'),
        filePath
      ],
      { stdio: 'inherit' }
    );

    child.on('exit', (code) => {
      if (code === 0) {
        console.log('Windows installer signing completed successfully.');
        resolve();
      } else {
        reject(new Error(`Signing script exited with code ${code}`));
      }
    });
  });
}
