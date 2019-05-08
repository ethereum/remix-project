var helpers = require('./contracts')

module.exports = function (browser, callback) {
  browser.clickLaunchIcon = helpers.clickLaunchIcon
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
  browser.click('#icon-panel div[plugin="pluginManager"]')
  .execute(function () {
    document.querySelector('div[id="pluginManager"]').scrollTop = document.querySelector('div[id="pluginManager"]').scrollHeight
  }, [], function () {
    browser.click('#pluginManager article[title="solidity"] button')
    .click('#pluginManager article[title="run"] button')
    .click('#pluginManager article[title="solidityStaticAnalysis"] button')
    .click('#pluginManager article[title="debugger"] button')
    .click('#icon-panel div[plugin="fileExplorers"]')
    .perform(() => { callback() })
  })
}
