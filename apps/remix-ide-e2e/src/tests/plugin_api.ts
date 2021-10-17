'use strict'
import { ExternalProfile, LocationProfile, Profile } from '@remixproject/plugin-utils'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testmode: boolean; }
}

const localPluginData: Profile & LocationProfile & ExternalProfile = {
  name: 'localPlugin',
  displayName: 'Local Plugin',
  canActivate: ['dGitProvider', 'flattener', 'solidityUnitTesting'],
  url: 'http://localhost:2020',
  location: 'sidePanel'
}

const getBrowserLogs = function (browser: NightwatchBrowser) {
  browser.getLog('browser', (logEntries) => {
    console.log(logEntries)
  })
}

const clickAndCheckLog = function (browser: NightwatchBrowser, buttonText: string, msg: any, payload: string) {
  if (payload) {
    browser.clearValue('//*[@id="payload"]').setValue('//*[@id="payload"]', payload).pause(1000)
  }
  if (msg && typeof msg !== 'string') msg = JSON.stringify(msg)
  browser
    .useXpath().waitForElementVisible(`//*[@data-id='${buttonText}']`).click(`//*[@data-id='${buttonText}']`)
    .pause(2000)

  getBrowserLogs(browser)
  if (msg) {
    browser.waitForElementVisible('//*[@id="methods"]').verify.containsText('//*[@id="methods"]', msg)
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

  'Should connect a local plugin': function (browser: NightwatchBrowser) {
    browser.addLocalPlugin(localPluginData)
      // @ts-ignore
      .frame(0)
  },

  'Should get current workspace': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'default_workspace', isLocalhost: false, absolutePath: '.workspaces/default_workspace' }, null)
  },
  'Should get current files': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null)
  },
  'Should throw error on current file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'Error from IDE : Error: No such file or directory No file selected', null)
  },
  'Should open readme.txt': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:open', null, 'README.txt')
  },
  'Should have current file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'README.txt', null)
  },
  'Should activate solidityUnitTesting': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'manager:activatePlugin', null, 'solidityUnitTesting')
    browser.frameParent()
    assertPluginIsActive(browser, 'solidityUnitTesting')
    // @ts-ignore
    browser.frame(0)
  },

  'Should switch to file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:switchFile', null, 'contracts/1_Storage.sol')
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'contracts/1_Storage.sol', null)
    clickAndCheckLog(browser, 'fileManager:switchFile', null, 'README.txt')
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'README.txt', null)
  },
  'Should write to file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:writeFile', 'README.txt', null)
  }

}
