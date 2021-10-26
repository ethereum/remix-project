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

const clearPayLoad = async (browser: NightwatchBrowser) => {
  return new Promise((resolve) => {
    browser.clearValue('//*[@id="payload"]', () => {
      resolve(true)
    })
  })
}

const clickButton = async (browser: NightwatchBrowser, buttonText: string) => {
  return new Promise((resolve) => {
    browser.useXpath().waitForElementVisible(`//*[@data-id='${buttonText}']`).pause(100)
      .click(`//*[@data-id='${buttonText}']`, async () => {
        await checkForAcceptAndRemember(browser)
        browser.waitForElementContainsText('//*[@id="callStatus"]', 'stop').perform(() => resolve(true))
      })
  })
}

const checkForAcceptAndRemember = async function (browser: NightwatchBrowser) {
  return new Promise((resolve) => {
    browser.frameParent().element('xpath', '//*[@data-id="modalDialogModalBody"]', (visible:any) => {
      if (visible.status && visible.status === -1) {
        // @ts-ignore
        browser.frame(0, () => { resolve(true) })
      } else {
        browser.waitForElementVisible('//*[@id="remember"]').click('//*[@id="remember"]').click('//*[@id="modal-footer-ok"]', () => {
          // @ts-ignore
          browser.frame(0, () => { resolve(true) })
        })
      }
    })
  })
}

const clickAndCheckLog = async (browser: NightwatchBrowser, buttonText: string, methodResult: any, eventResult: any, payload: any) => {
  if (payload) {
    await setPayload(browser, payload)
  } else {
    await clearPayLoad(browser)
  }
  if (methodResult && typeof methodResult !== 'string') { methodResult = JSON.stringify(methodResult) }
  if (eventResult && typeof eventResult !== 'string') { eventResult = JSON.stringify(eventResult) }
  if (buttonText) {
    await clickButton(browser, buttonText)
  }
  await debugValues(browser, 'methods', methodResult)
  await debugValues(browser, 'events', eventResult)
}

const assertPluginIsActive = function (browser: NightwatchBrowser, id: string, shouldBeVisible: boolean) {
  if (shouldBeVisible) {
    browser.waitForElementVisible(`//*[@data-id="verticalIconsKind${id}"]`)
  } else {
    browser.waitForElementNotPresent(`//*[@data-id="verticalIconsKind${id}"]`)
  }
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

  // UDAPP
  'Should get accounts': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'udapp:getAccounts', '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', null, null)
  },

  // context menu item

  'Should create context menu item': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:registerContextMenuItem', null, null, {
      id: 'localPlugin',
      name: 'testCommand',
      label: 'testCommand',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: []
    })
    await browser.useXpath().frameParent(async () => {
      browser.useCss().clickLaunchIcon('filePanel')
        .waitForElementVisible('[data-id="treeViewLitreeViewItemcontracts"]').element('css selector', '[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]', (visible: any) => {
          if (visible.status && visible.status === -1) {
            browser.click('[data-id="treeViewLitreeViewItemcontracts"]')
          }
        })
        .waitForElementVisible('[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
        .rightClick('[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]').useXpath().waitForElementVisible('//*[@id="menuitemtestcommand"]').click('//*[@id="menuitemtestcommand"]', async () => {
        // @ts-ignore
          browser.click('//*[@data-id="verticalIconsKindlocalPlugin"]').frame(0, async () => {
            await clickAndCheckLog(browser, null, { id: 'localPlugin', name: 'testCommand', label: 'testCommand', type: [], extension: ['.sol'], path: ['contracts/1_Storage.sol'], pattern: [] }, null, null)
          })
        })
    })
  },

  // FILESYSTEM

  'Should get current workspace': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:getCurrentWorkspace', { name: 'default_workspace', isLocalhost: false, absolutePath: '.workspaces/default_workspace' }, null, null)
  },

  'Should get current files': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:readdir', { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } }, null, '/')
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
  'Should set file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'fileManager:setFile', null, { event: 'fileAdded', args: ['new.sol'] }, ['new.sol', 'test'])
    await clickAndCheckLog(browser, 'fileManager:readFile', 'test', null, 'new.sol')
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
    await clickAndCheckLog(browser, 'filePanel:createWorkspace', null, null, ['emptyworkspace', true])
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
    await clickAndCheckLog(browser, 'filePanel:createWorkspace', null, { event: 'setWorkspace', args: [{ name: 'newspace', isLocalhost: false }] }, 'newspace')
  },
  'Should have event when switching workspace': async function (browser: NightwatchBrowser) {
    // @ts-ignore
    browser.frameParent().useCss().clickLaunchIcon('filePanel').click('*[data-id="workspacesSelect"] option[value="default_workspace"]').useXpath().click('//*[@data-id="verticalIconsKindlocalPlugin"]').frame(0, async () => {
      await clickAndCheckLog(browser, null, null, { event: 'setWorkspace', args: [{ name: 'default_workspace', isLocalhost: false }] }, null)
    })
  },
  'Should rename workspace': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'filePanel:renameWorkspace', null, null, ['default_workspace', 'renamed'])
    await clickAndCheckLog(browser, 'filePanel:getWorkspaces', ['emptyworkspace', 'testspace', 'newspace', 'renamed'], null, null)
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
  'Should have git log': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'dGitProvider:log', 'commit-message', null, null)
  },
  'Should have branches': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'dGitProvider:branches', [{ name: 'main' }], null, null)
  },
  // resolver
  'Should resolve url': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'contentImport:resolve', '# Remix Project', null, 'https://github.com/ethereum/remix-project/blob/master/README.md')
  },
  'Should resolve and save url': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'contentImport:resolveAndSave', '# Remix Project', { event: 'fileAdded', args: ['.deps/github/ethereum/remix-project/README.md'] }, 'https://github.com/ethereum/remix-project/blob/master/README.md')
  },
  // UNIT TESTING
  'Should activate solidityUnitTesting': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'manager:activatePlugin', null, null, 'solidityUnitTesting')
    browser.frameParent()
    assertPluginIsActive(browser, 'solidityUnitTesting', true)
    // @ts-ignore
    browser.frame(0)
    await clickAndCheckLog(browser, 'manager:isActive', true, null, 'solidityUnitTesting')
  },

  'Should test from path with solidityUnitTesting': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'solidityUnitTesting:testFromPath', '"totalPassing":2,"totalFailing":0', null, 'tests/4_Ballot_test.sol')
  },

  'Should deactivate solidityUnitTesting': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'manager:deactivatePlugin', null, null, 'solidityUnitTesting')
    browser.frameParent()
    assertPluginIsActive(browser, 'solidityUnitTesting', false)
    // @ts-ignore
    browser.frame(0)
    await clickAndCheckLog(browser, 'manager:isActive', false, null, 'solidityUnitTesting')
  },

  // COMPILER

  'Should compile a file': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'solidity:compile', null, null, 'contracts/1_Storage.sol')
    browser.pause(5000, async () => {
      await clickAndCheckLog(browser, 'solidity:compile', null, 'compilationFinished', null)
    })
  },

  'Should get compilationresults': async function (browser: NightwatchBrowser) {
    await clickAndCheckLog(browser, 'solidity:getCompilationResult', 'contracts/1_Storage.sol', null, null)
  }
}
