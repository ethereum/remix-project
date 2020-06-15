require('dotenv').config()

module.exports = function (browser, callback, url, preloadPlugins = true) {
  browser
    .url(url || 'http://127.0.0.1:4200')
    .pause(5000)
    .switchBrowserTab(0)
    .injectScript('test-browser/helpers/applytestmode.js', function () {
      browser.fullscreenWindow(() => {
        if (preloadPlugins) {
          initModules(browser, () => {
            browser.clickLaunchIcon('solidity')
            .pause(2000)
            .execute(() => {
              document.getElementById('autoCompile').click()
            })
          })
        }
      })
      .perform(() => {
        callback()
      })
    })
}

function initModules (browser, callback) {
  browser.pause(5000)
    .click('#icon-panel div[plugin="pluginManager"]')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_solidity"] button')
    .pause(5000)
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_udapp"] button')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_solidityStaticAnalysis"] button')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
    .scrollAndClick('#icon-panel div[plugin="fileExplorers"]')
    .clickLaunchIcon('settings')
    .setValue('#gistaccesstoken', process.env.gist_token)
    .click('#savegisttoken')
    .click('#settingsView #Flatly') // e2e tests were initially developed with Flatly. Some tests are failing with the default one (Dark), because the dark theme put uppercase everywhere.
    .perform(() => { callback() })
}
