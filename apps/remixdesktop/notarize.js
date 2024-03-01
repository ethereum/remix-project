
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context; // Provided by electron-builder

  console.log('NOTARIZING');

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appBundleId: 'com.example.yourapp', // Your app's bundle ID
    appPath: `${appOutDir}/${appName}.app`, // Path to your .app
    appleId: process.env.APPLE_ID, // Your Apple ID
    appleIdPassword: process.env.APPLE_ID_PASSWORD, // App-specific password
    ascProvider: process.env.APPLE_TEAM_ID, // Your Apple Developer team ID (optional)
  });
};