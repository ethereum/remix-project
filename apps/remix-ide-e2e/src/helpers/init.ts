import { NightwatchBrowser } from 'nightwatch'

require('dotenv').config()

export default function (browser: NightwatchBrowser, callback: VoidFunction, url?: string, preloadPlugins = true, closeWorkspaceAlert = true): void {
  browser
    .url(url || 'http://127.0.0.1:8080')
    .pause(5000)
    .switchBrowserTab(0)
    .perform((done) => {
      if (closeWorkspaceAlert) {
        browser.waitForElementVisible('*[data-id="modalDialogModalBody"]', 60000)
          .modalFooterOKClick()
      }
      done()
    })
    .fullscreenWindow(() => {
      if (preloadPlugins) {
        initModules(browser, () => {
          browser.clickLaunchIcon('solidity')
            .waitForElementVisible('[for="autoCompile"]')
            .click('[for="autoCompile"]')
            .verify.elementPresent('[data-id="compilerContainerAutoCompile"]:checked')
        })
      }
    })
    .perform(() => {
      callback()
    })
}

function initModules (browser: NightwatchBrowser, callback: VoidFunction) {
  browser.pause(5000)
    .click('[data-id="verticalIconsKindpluginManager"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtonsolidityStaticAnalysis"]')
    .scrollAndClick('[data-id="pluginManagerComponentActivateButtondebugger"]')
    .scrollAndClick('[data-id="verticalIconsKindfilePanel"]')
    .clickLaunchIcon('settings')
    .click('*[data-id="settingsTabGenerateContractMetadataLabel"]')
    .setValue('[data-id="settingsTabGistAccessToken"]', process.env.gist_token)
    .click('[data-id="settingsTabSaveGistToken"]')
    .click('[data-id="settingsTabThemeLabelFlatly"]') // e2e tests were initially developed with Flatly. Some tests are failing with the default one (Dark), because the dark theme put uppercase everywhere.
    .perform(() => { callback() })
}
