'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testmode: boolean; }
}

const localPluginData = {
  pluginName: 'localPlugin',
  pluginDisplayName: 'Local Plugin',
  pluginCanActivate: 'dGitProvider,flattener,solidityUnitTesting',
  pluginUrl: 'http://localhost:2020'
}

const getBrowserLogs = function (browser: NightwatchBrowser) {
  browser.getLog('browser', (logEntries) => {
    console.log(logEntries)
  })
}
/*
* PLUGINACTION
* buttonText: which button to click
* msg: what to expect from the log
* payload: extra param for the call
*/
const pluginAction = function (browser: NightwatchBrowser, buttonText: string, msg: any, payload: string) {
  if (payload) {
    browser.clearValue('//*[@id="payload"]').setValue('//*[@id="payload"]', payload).pause(1000)
  }
  if (msg && typeof msg !== 'string') msg = JSON.stringify(msg)
  browser
    .useXpath().waitForElementVisible(`//*[text()='${buttonText}']`).click(`//*[text()='${buttonText}']`)
    .pause(2000)

  getBrowserLogs(browser)
  if (msg) {
    browser.waitForElementVisible('//*[@id="log"]').verify.containsText('//*[@id="log"]', msg)
  }
}

const assertPluginIsActive = function (browser: NightwatchBrowser, id: string) {
  browser.waitForElementVisible(`//*[@data-id="verticalIconsKind${id}"]`)
}

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },

  afterEach: function (browser: NightwatchBrowser) {
    browser.getLog('browser', (logEntries) => {
      console.log(logEntries)
    })
  },

  'Should Load Plugin Manager': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
      .pause(3000)
      .click('*[plugin="pluginManager"]')
      .pause(3000)
      .waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'PLUGIN MANAGER')
  },

  'Should connect a local plugin': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
      .execute(function () {
        window.testmode = true
      })
      .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
      .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]')
      .waitForElementVisible('*[data-id="localPluginName"]')
      .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', localPluginData.pluginName)
      .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', localPluginData.pluginDisplayName)
      .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', localPluginData.pluginUrl)
      .clearValue('*[data-id="localPluginCanActivate"]').setValue('*[data-id="localPluginCanActivate"]', localPluginData.pluginCanActivate)
      .click('*[data-id="localPluginRadioButtoniframe"]')
      .click('*[data-id="localPluginRadioButtonsidePanel"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
      .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react')
      .waitForElementVisible('[data-id="verticalIconsKindlocalPlugin"]')
      .click('[data-id="verticalIconsKindlocalPlugin"]')
      // @ts-ignore
      .frame(0)
  },

  'Should get current workspace': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'get workspace', { name: 'default_workspace', isLocalhost: false, absolutePath: '.workspaces/default_workspace' }, null)
  },
  'Should get current files': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null)
  },
  'Should throw error on current file': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'getcurrentfile', 'Error from IDE : Error: No such file or directory No file selected', null)
  },
  'Should open readme.txt': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'openfile', null, 'README.txt')
  },
  'Should have current file': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'getcurrentfile', 'README.txt', null)
  },
  'Should activate solidityUnitTesting': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'activate', null, 'solidityUnitTesting')
    browser.frameParent()
    assertPluginIsActive(browser, 'solidityUnitTesting')
    // @ts-ignore
    browser.frame(0)
  },

  'Should switch to file': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'switch to file', null, 'contracts/1_Storage.sol')
    pluginAction(browser, 'getcurrentfile', 'contracts/1_Storage.sol', null)
    pluginAction(browser, 'switch to file', null, 'README.txt')
    pluginAction(browser, 'getcurrentfile', 'README.txt', null)
  },
  'Should write to file': function (browser: NightwatchBrowser) {
    pluginAction(browser, 'write', 'README.txt', null)
  }

}
