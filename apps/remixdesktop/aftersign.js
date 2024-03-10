const { notarize } = require('@electron/notarize')
const fs = require('fs')
const { exec } = require('child_process') // Import the exec function
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context // Provided by electron-builder

  console.log('NOTARIZING')

  if (electronPlatformName !== 'darwin' || !process.env.CIRCLE_BRANCH) {
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = `${appOutDir}/${appName}.app`

  // Function to check if the app is stapled
  function checkStapleStatus() {
    exec(`xcrun stapler validate "${appPath}"`, async (error, stdout, stderr) => {
      if (error) {
        console.log(`App is not stapled: ${error.message}`)
        await runNotarize()
        return
      }
      if (stderr) {
        console.log(`App is not stapled: ${stderr}`)
        await runNotarize()
        return
      }
      console.log('App is already stapled. No action needed.')
    })
  }




  async function runNotarize() {

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
      console.log('STAPLING')

      exec(`xcrun stapler staple "${appPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }
        console.log(`Stapling output: ${stdout}`)
        console.error(`Stapling errors: ${stderr}`)
      })
    } catch (error) {
      console.error('Error during notarization:', error)
    }

  }

  checkStapleStatus()
}
