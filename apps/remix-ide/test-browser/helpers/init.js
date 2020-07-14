require('dotenv').config()

module.exports = function (browser, callback, url, preloadPlugins = true) {
  browser
    .url(url || 'http://127.0.0.1:4200')
    .pause(5000)
    .switchBrowserTab(0)
    .injectScript('test-browser/helpers/applytestmode.js', function () {
      browser.fullscreenWindow(() => {
        if (preloadPlugins) {
          console.log('preloadPlugins: ', preloadPlugins)
          initModules(browser, () => {
            browser.clickLaunchIcon('solidity')
            .waitForElementPresent('[for="autoCompile"]')
            .click('[for="autoCompile"]')
          })
        }
      })
    })
    .perform(() => {
      callback()
    })
}

function initModules (browser, callback) {
  browser.pause(5000)
    .click('[data-id="verticalIconsKindpluginManager"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtonsolidityStaticAnalysis"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtondebugger"]')
    .scrollAndClick('[data-id="verticalIconsKindfileExplorers"]')
    .clickLaunchIcon('settings')
    .setValue('[data-id="settingsTabGistAccessToken"]', process.env.gist_token)
    .click('[data-id="settingsTabSaveGistToken"]')
    .click('[data-id="settingsTabThemeFlatly"]') // e2e tests were initially developed with Flatly. Some tests are failing with the default one (Dark), because the dark theme put uppercase everywhere.
    .perform(() => { callback() })
}
