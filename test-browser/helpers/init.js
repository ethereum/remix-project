module.exports = function (browser, callback, url, preloadPlugins = true) {
  browser
    .url(url || 'http://127.0.0.1:8080')
    .injectScript('test-browser/helpers/applytestmode.js', function () {
      browser.resizeWindow(2560, 1440, () => {
        if (preloadPlugins) {
          initModules(browser, () => {
            browser.clickLaunchIcon('solidity').click('#autoCompile')
            .perform(function () {
              callback()
            })
          })
        } else callback()
      })
    })
}

function initModules (browser, callback) {
  browser.pause(3000)
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
    .perform(() => { callback() })
}
