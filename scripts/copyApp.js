/**
 *
 */
const { AppManager } = require('@philipplgh/electron-app-manager')

const updater = new AppManager({
  repository: 'https://github.com/yann300/remix-desktop',
  auto: false,
  cacheDir: __dirname + '/cache'
})

;(async function() {
  await updater.clearCache()
  await updater.getLatest({
    download: true
  })
})()
