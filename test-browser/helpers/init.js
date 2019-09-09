module.exports = function (browser, callback) {
  browser
    .url('http://127.0.0.1:8080')
    .injectScript('test-browser/helpers/applytestmode.js', function () {
      browser.resizeWindow(2560, 1440, () => {
        initModules(browser, () => {
          browser.clickLaunchIcon('solidity').click('#autoCompile')
          .perform(function () {
            callback()
          })
        })
      })
    })
}

function initModules (browser, callback) {
  browser.pause(3000)
    .click('#icon-panel div[plugin="pluginManager"]')
    .scrollInto('#pluginManager article[id="remixPluginManagerListItem_solidity"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_solidity"] button')
    .pause(5000)
    .scrollInto('#pluginManager article[id="remixPluginManagerListItem_udapp"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_udapp"] button')
    .scrollInto('#pluginManager article[id="remixPluginManagerListItem_solidityStaticAnalysis"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_solidityStaticAnalysis"] button')
    .scrollInto('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
    .scrollInto('#icon-panel div[plugin="fileExplorers"]')
    .click('#icon-panel div[plugin="fileExplorers"]')
    .perform(() => { callback() })
}
