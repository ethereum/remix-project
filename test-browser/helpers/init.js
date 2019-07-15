module.exports = function (browser, callback) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
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
  browser.pause(3000).click('#icon-panel div[plugin="pluginManager"]')
  .execute(function () {
    document.querySelector('div[id="pluginManager"]').scrollTop = document.querySelector('div[id="pluginManager"]').scrollHeight
  }, [], function () {
    browser.click('#pluginManager article[id="remixPluginManagerListItem_solidity"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_udapp"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_solidityStaticAnalysis"] button')
    .click('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
    .click('#icon-panel div[plugin="fileExplorers"]')
    .perform(() => { callback() })
  })
}
