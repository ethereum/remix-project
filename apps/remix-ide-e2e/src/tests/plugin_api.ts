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

const getBrowserLogs = async function (browser: NightwatchBrowser) {
  browser.getLog('browser', (logEntries) => {
    if (logEntries && logEntries.length > 0) {
      console.log('Browser log:')
      console.log(logEntries)
    }
  })
}
const debugValues = async function (browser: NightwatchBrowser, field: string, expected: any) {
  return new Promise((resolve) => {
    if (!expected) {
      resolve(true)
      return
    }
    browser.waitForElementVisible(`//*[@id="${field}"]`).getText(`//*[@id="${field}"]`, (result) => {
      console.log(result)
      if (!result.value.toString().includes(expected)) {
        console.log('Actual result:')
        console.log(result.value.toString())
        console.log('Expected result:')
        console.log(expected)
        getBrowserLogs(browser)
        browser.assert.ok(false, 'Returned value from call does not match expected value.')
      } else {
        browser.assert.ok(true)
      }
      resolve(true)
    })
  })
}

const setPayload = async (browser: NightwatchBrowser, payload: any) => {
  return new Promise((resolve) => {
    if (typeof payload !== 'string') payload = JSON.stringify(payload)
    browser.clearValue('//*[@id="payload"]').setValue('//*[@id="payload"]', payload, (result) => {
      resolve(result)
    })
  })
}

const clickButton = async (browser: NightwatchBrowser, buttonText: string) => {
  return new Promise((resolve) => {
    browser.useXpath().waitForElementVisible(`//*[@data-id='${buttonText}']`)
      .click(`//*[@data-id='${buttonText}']`)
      .pause(2000, () => resolve(true))
  })
}

const checkForAcceptAndRemember = async function (browser: NightwatchBrowser) {
  return new Promise((resolve) => {
    browser.frameParent().element('xpath', '//*[@data-id="modalDialogModalBody"]', (visible:any) => {
      if (visible.status && visible.status === -1) {
        // @ts-ignore
        browser.frame(0, () => { resolve(true) })
      } else {
        browser.click('//*[@id="remember"]').click('//*[@id="modal-footer-ok"]', () => {
          // @ts-ignore
          browser.frame(0, () => { resolve(true) })
        })
      }
    })
  })
}

const setAppend = async (browser: NightwatchBrowser) => {
  return new Promise((resolve) => {
    browser.waitForElementVisible('//*[@id="appendToLog"]').click('//*[@id="appendToLog"]', () => {
      resolve(true)
    })
  })
}

const clickAndCheckLog = async (browser: NightwatchBrowser, buttonText: string, methodResult: any, eventResult: any, payload: any) => {
  if (payload) {
    await setPayload(browser, payload)
  }
  if (methodResult && typeof methodResult !== 'string') { methodResult = JSON.stringify(methodResult) }
  if (eventResult && typeof eventResult !== 'string') { eventResult = JSON.stringify(eventResult) }
  await clickButton(browser, buttonText)
  await checkForAcceptAndRemember(browser)
  await debugValues(browser, 'methods', methodResult)
  await debugValues(browser, 'events', eventResult)
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
      .frame(0).useXpath()
  },

  // FILESYSTEM

  'Should get current workspace': async function (browser: NightwatchBrowser) {
    await browser.pause(20000)
    await clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'default_workspace', isLocalhost: false, absolutePath: '.workspaces/default_workspace' }, null, null)
  },

  'Should get current files': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null, null)
  },
  'Should throw error on current file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'Error from IDE : Error: No such file or directory No file selected', null, null)
  },
  'Should open readme.txt': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:open', null, { event: 'currentFileChanged', args: ['README.txt'] }, 'README.txt')
  },
  'Should have current file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'README.txt', null, null)
  },
  'Should create dir': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:mkdir', null, null, 'testdir')
    await clickAndCheckLog(browser, 'fileManager:readdir', 'testdir', null, '/')
  },
  'Should get file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:getFile', 'REMIX EXAMPLE PROJECT', null, 'README.txt')
  },
  'Should close all files': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:closeAllFiles', null, { event: 'noFileSelected', args: [] }, null)
  },

  'Should switch to file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:switchFile', null, { event: 'currentFileChanged', args: ['contracts/1_Storage.sol'] }, 'contracts/1_Storage.sol')
    await clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'contracts/1_Storage.sol', null, null)
    await clickAndCheckLog(browser, 'fileManager:switchFile', null, { event: 'currentFileChanged', args: ['README.txt'] }, 'README.txt')
    await clickAndCheckLog(browser, 'fileManager:getCurrentFile', 'README.txt', null, null)
  },
  'Should write to file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:writeFile', null, { event: 'fileSaved', args: ['README.txt'] }, ['README.txt', 'test'])
    await clickAndCheckLog(browser, 'fileManager:readFile', 'test', null, 'README.txt')
  },
  'Should write to new file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:writeFile', null, { event: 'fileAdded', args: ['testing.txt'] }, ['testing.txt', 'test'])
    await clickAndCheckLog(browser, 'fileManager:readFile', 'test', null, 'testing.txt')
  },
  'Should rename file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:rename', null, null, ['testing.txt', 'testrename.txt'])
    await clickAndCheckLog(browser, 'fileManager:readFile', 'test', null, 'testrename.txt')
  },

  'Should create empty workspace': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:createWorkspace', null, null, ['emptyworkspace', false])
    await clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'emptyworkspace', isLocalhost: false, absolutePath: '.workspaces/emptyworkspace' }, null, null)
    await clickAndCheckLog(browser, 'fileManager:readdir', {}, null, '/')
  },
  'Should create workspace': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:createWorkspace', null, null, 'testspace')
    await clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'testspace', isLocalhost: false, absolutePath: '.workspaces/testspace' }, null, null)
    await clickAndCheckLog(browser, 'fileManager:readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null, null)
  },
  'Should get all workspaces': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:getWorkspaces', ['default_workspace', 'emptyworkspace', 'testspace'], null, null)
  },
  'Should have set workspace event': async function (browser: NightwatchBrowser) {
    await setAppend(browser)
    await clickAndCheckLog(browser, 'filePanel:createWorkspace', null, { event: 'setWorkspace', args: [{ name: 'newspace', isLocalhost: false }] }, 'newspace')
    await setAppend(browser)
  },

  // COMPILER

  'Should compile a file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'solidity:compile', null, null, 'contracts/1_Storage.sol')
  },

  'Should get compilationresults': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'solidity:getCompilationResult', 'contracts/1_Storage.sol', null, null)
  },

  // DGIT
  'Should have changes on new workspace': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:createWorkspace', null, null, 'dgit')
    await clickAndCheckLog(browser, 'dGitProvider:status', [['README.txt', 0, 2, 0], ['contracts/1_Storage.sol', 0, 2, 0], ['contracts/2_Owner.sol', 0, 2, 0], ['contracts/3_Ballot.sol', 0, 2, 0], ['scripts/deploy_ethers.js', 0, 2, 0], ['scripts/deploy_web3.js', 0, 2, 0], ['tests/4_Ballot_test.sol', 0, 2, 0]], null, null)
  },

  'Should stage contract': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'dGitProvider:add', null, null, {
      filepath: 'contracts/1_Storage.sol'
    })
    await clickAndCheckLog(browser, 'dGitProvider:status', [['README.txt', 0, 2, 0], ['contracts/1_Storage.sol', 0, 2, 2], ['contracts/2_Owner.sol', 0, 2, 0], ['contracts/3_Ballot.sol', 0, 2, 0], ['scripts/deploy_ethers.js', 0, 2, 0], ['scripts/deploy_web3.js', 0, 2, 0], ['tests/4_Ballot_test.sol', 0, 2, 0]], null, null)
  },
  'Should commit changes': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'dGitProvider:commit', null, null, { author: { name: 'Remix', email: 'Remix' }, message: 'commit-message' })
    await clickAndCheckLog(browser, 'dGitProvider:log', 'commit-message', null, null)
  },

  // UNIT TESTING
  'Should activate solidityUnitTesting': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'manager:activatePlugin', null, null, 'solidityUnitTesting')
    browser.frameParent()
    assertPluginIsActive(browser, 'solidityUnitTesting')
    // @ts-ignore
    browser.frame(0)
  },

  'Should test from path with solidityUnitTesting': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'solidityUnitTesting:testFromPath', '"totalPassing":2,"totalFailing":0', null, 'tests/4_Ballot_test.sol')
  }
}
