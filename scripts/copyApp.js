/**
 *
 */
const { AppManager } = require('@philipplgh/electron-app-manager')
const path = require('path')
const fs = require('fs')

/*
 * taken from https://github.com/ethereum/grid/blob/a499008b6f91c6c9a5bc5147ca8782c9a2ef0400/utils/main/util.js#L59
 *
 */
const getShippedGridUiPath = () => {
  const REMIX_UI_CACHE = path.join(__dirname, '..', '..', 'shipped-remix-ui')
  if (!fs.existsSync(REMIX_UI_CACHE)) {
    fs.mkdirSync(REMIX_UI_CACHE, { recursive: true })
  }
  return REMIX_UI_CACHE
}

const updater = new AppManager({
  repository: 'https://github.com/ethereum/remix-desktop',
  auto: false,
  cacheDir: getShippedGridUiPath()
})

;(async function() {
  await updater.clearCache()
  await updater.getLatest({
    download: true
  })
})()
