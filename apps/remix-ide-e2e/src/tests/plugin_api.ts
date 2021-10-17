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

const clickAndCheckLog = function (browser: NightwatchBrowser, buttonText: string, methodResult: any, eventResult: any, payload: any) {
  if (payload) {
    if (typeof payload !== 'string') payload = JSON.stringify(payload)
    browser.clearValue('//*[@id="payload"]').setValue('//*[@id="payload"]', payload).pause(1000)
  }
  if (methodResult && typeof methodResult !== 'string') methodResult = JSON.stringify(methodResult)
  if (eventResult && typeof eventResult !== 'string') eventResult = JSON.stringify(eventResult)
  browser
    .useXpath().waitForElementVisible(`//*[@data-id='${buttonText}']`).click(`//*[@data-id='${buttonText}']`)
    .pause(2000)

  getBrowserLogs(browser)
  if (methodResult) {
    browser.waitForElementVisible('//*[@id="methods"]').verify.containsText('//*[@id="methods"]', methodResult)
  }
  if (eventResult) {
    browser.waitForElementVisible('//*[@id="events"]').verify.containsText('//*[@id="events"]', eventResult)
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

  // FILESYSTEM

  'Should get current workspace': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'default_workspace', isLocalhost: false, absolutePath: '.workspaces/default_workspace' }, null, null)
  },
  'Should get current files': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null, null)
  },
  'Should throw error on current file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'Error from IDE : Error: No such file or directory No file selected', null, null)
  },
  'Should open readme.txt': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:open', null, { event: 'currentFileChanged', args: ['README.txt'] }, 'README.txt')
  },
  'Should have current file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'README.txt', null, null)
  },
  'Should create dir': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:mkdir', null, null, 'testdir')
    clickAndCheckLog(browser, 'fileManager:readdir', 'testdir', null, '/')
  },
  'Should get file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:getFile', 'REMIX EXAMPLE PROJECT', null, 'README.txt')
  },
  'Should close all files': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:closeAllFiles', null, { event: 'noFileSelected', args: [] }, null)
  },

  'Should switch to file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:switchFile', null, { event: 'currentFileChanged', args: ['contracts/1_Storage.sol'] }, 'contracts/1_Storage.sol')
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'contracts/1_Storage.sol', null, null)
    clickAndCheckLog(browser, 'fileManager:switchFile', null, { event: 'currentFileChanged', args: ['README.txt'] }, 'README.txt')
    clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'README.txt', null, null)
  },
  'Should write to file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'fileManager:writeFile', null, { event: 'fileSaved', args: ['README.txt'] }, ['README.txt', 'test'])
    // @ts-ignore
    browser.frameParent().acceptAndRemember(true, true).frame(0)
    clickAndCheckLog(browser, 'fileManager:readFile', 'test', null, 'README.txt')
  },

  'Should create workspace': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'filePanel:createWorkspace', null, null, 'testspace')
    clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'testspace', isLocalhost: false, absolutePath: '.workspaces/testspace' }, null, null)
    clickAndCheckLog(browser, 'fileManager:readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null, null)
  },

  // COMPILER

  'Should compile a file': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'solidity:compile', null, null, 'contracts/1_Storage.sol')
  },

  'Should get compilationresults': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'solidity:getCompilationResult', 'contracts/1_Storage.sol', null, null)
  },

  // UNIT TESTING
  'Should activate solidityUnitTesting': function (browser: NightwatchBrowser) {
    clickAndCheckLog(browser, 'manager:activatePlugin', null, null, 'solidityUnitTesting')
    browser.frameParent()
    assertPluginIsActive(browser, 'solidityUnitTesting')
    // @ts-ignore
    browser.frame(0)
  }
}
