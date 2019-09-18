/**
 *
 */
const { getShippedGridUiPath } = require('../utils/main/util')
const { AppManager } = require('@philipplgh/electron-app-manager')

const GRID_UI_CACHE = getShippedGridUiPath()

const updater = new AppManager({
  repository: 'https://github.com/ethereum/grid-ui',
  auto: false,
  cacheDir: GRID_UI_CACHE
})

;(async function() {
  await updater.clearCache()
  await updater.getLatest({
    download: true
  })
})()
