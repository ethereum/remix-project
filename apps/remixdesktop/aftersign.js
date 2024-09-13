const { notarize } = require('@electron/notarize')
const fs = require('fs')
const { exec } = require('child_process') // Import the exec function

// read the environment variables from process

console.log(process.env.DO_NOT_NOTARIZE)

if (process.env.DO_NOT_NOTARIZE) {
  console.log('NOTARIZING DISABLED')
  exports.default = async function notarizing(context) {
    return []
  }
} else {

  exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context // Provided by electron-builder

    console.log('NOTARIZING')

    if (electronPlatformName !== 'darwin' || !process.env.CIRCLE_BRANCH) {
      return
    }

    const appName = context.packager.appInfo.productFilename
    const appPath = `${appOutDir}/${appName}.app`

    // Function to promisify the exec command
    function execShellCommand(cmd) {
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

    // Function to check if the app is stapled
    // Async function to check the stapling status
    async function checkStapleStatus() {
      try {
        console.log(`xcrun stapler validate "${appPath}"`)
        await execShellCommand(`xcrun stapler validate "${appPath}"`);
        console.log('App is already stapled. No action needed.');
        return true
      } catch (error) {
        console.log(`App is not stapled: ${error.message}`);
        return false
      }
    }




    async function runNotarize() {

      console.log('NOTARIZING + ', `xcrun stapler staple "${appPath}"`)
      console.log({
        appBundleId: 'org.ethereum.remix-ide', // Your app's bundle ID
        appPath: `${appOutDir}/${appName}.app`, // Path to your .app
        appleId: process.env.APPLE_ID, // Your Apple ID
        appleIdPassword: process.env.APPLE_ID_PASSWORD, // App-specific password
        teamId: process.env.APPLE_TEAM_ID, // Your Apple Developer team ID (optional)
      })

      try {
        const r = await notarize({
          appBundleId: 'org.ethereum.remix-ide', // Your app's bundle ID
          appPath: `${appOutDir}/${appName}.app`, // Path to your .app
          appleId: process.env.APPLE_ID, // Your Apple ID
          appleIdPassword: process.env.APPLE_ID_PASSWORD, // App-specific password
          teamId: process.env.APPLE_TEAM_ID, // Your Apple Developer team ID (optional)
        })

        console.log(r)

        // Stapling the app
        console.log('STAPLING', `xcrun stapler staple "${appPath}"`)

        await execShellCommand(`xcrun stapler staple "${appPath}"`)

      } catch (error) {
        console.error('Error during notarization:', error)
        throw new Error('Error during notarization', error)
      }

    }

    if (!await checkStapleStatus()) {
      await runNotarize()
      await checkStapleStatus()
    } else {
      return []
    }
  }
}