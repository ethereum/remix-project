
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context; // Provided by electron-builder

  console.log('NOTARIZING');

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(appName);

  console.log({
    appBundleId: 'org.ethereum.remix-ide', // Your app's bundle ID
    appPath: `${appOutDir}/${appName}.app`, // Path to your .app
    appleId: process.env.APPLE_ID, // Your Apple ID
    appleIdPassword: process.env.APPLE_ID_PASSWORD, // App-specific password
    teamId: process.env.APPLE_TEAM_ID, // Your Apple Developer team ID (optional)
  })

  const r = await notarize({
    appBundleId: 'org.ethereum.remix-ide', // Your app's bundle ID
    appPath: `${appOutDir}/${appName}.app`, // Path to your .app
    appleId: process.env.APPLE_ID, // Your Apple ID
    appleIdPassword: process.env.APPLE_ID_PASSWORD, // App-specific password
    teamId: process.env.APPLE_TEAM_ID, // Your Apple Developer team ID (optional)
  });

  console.log(r);
};