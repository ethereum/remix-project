'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should execute `file` api from file manager external api #group1': function (browser: NightwatchBrowser) {
    browser
      .addFile('file.js', { content: executeFile })
      .executeScript('remix.exeCurrent()')
      .pause(1000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'file.js', 60000)
  },

  'Should execute `exists` api from file manager external api #group1': function (browser: NightwatchBrowser) {
    browser
      .addFile('exists.js', { content: executeExists })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'exists.js true', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'non-exists.js false', 60000)
  },

  'Should execute `open` api from file manager external api #group1': function (browser: NightwatchBrowser) {
    browser
      .addFile('open.js', { content: executeOpen })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'contracts/3_Ballot.sol', 60000)
  },

  'Should execute `writeFile` api from file manager external api #group1': function (browser: NightwatchBrowser) {
    browser
      .addFile('writeFile.js', { content: executeWriteFile })
      .executeScript('remix.exeCurrent()')
      .pause(2000)
      .openFile('new_contract.sol')
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('pragma solidity ^0.6.0') !== -1, 'content does not contain "pragma solidity ^0.6.0"')
      })
  },

  'Should execute `readFile` api from file manager external api #group2': function (browser: NightwatchBrowser) {
    browser
      .addFile('writeFile.js', { content: executeWriteFile })
      .executeScript('remix.exeCurrent()')
      .addFile('readFile.js', { content: executeReadFile })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'pragma solidity ^0.6.0', 60000)
  },

  'Should execute `copyFile` api from file manager external api #group2': function (browser: NightwatchBrowser) {
    browser
      .addFile('copyFile.js', { content: executeCopyFile })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'pragma solidity >=0.7.0 <0.9.0;', 60000)
  },

  'Should execute `rename` api from file manager external api #group2': function (browser: NightwatchBrowser) {
    browser
      .addFile('renameFile.js', { content: executeRename })
      .executeScript('remix.exeCurrent()')
      .pause(2000)
      .waitForElementPresent('[data-id="treeViewLitreeViewItemold_contract.sol"]', 60000)
  },

  'Should execute `mkdir` api from file manager external api #group3': function (browser: NightwatchBrowser) {
    browser
      .addFile('mkdirFile.js', { content: executeMkdir })
      .executeScript('remix.exeCurrent()')
      .pause(2000)
      .waitForElementPresent('[data-id="treeViewLitreeViewItemTest_Folder"]', 80000)
  },

  'Should execute `readdir` api from file manager external api #group3': function (browser: NightwatchBrowser) {
    browser
      .addFile('readdirFile.js', { content: executeReaddir })
      .executeScript('remix.exeCurrent()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Test_Folder isDirectory', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'true', 5000)
  },

  'Should execute `remove` api from file manager external api #group4': function (browser: NightwatchBrowser) {
    browser
      .addFile('old_contract.sol', { content: 'test' })
      .addFile('removeFile.js', { content: executeRemove })
      .executeScript('remix.exeCurrent()')
      .pause(2000)
      .waitForElementNotPresent('[data-id="treeViewLitreeViewItemold_contract.sol"]', 60000)
  },

  // TODO: Fix remove root directory prefix for browser and localhost
  'Should execute `remove` api from file manager external api on a folder #group4': function (browser: NightwatchBrowser) {
    browser
      .addFile('test_jsRemoveFolder.js', { content: executeRemoveOnFolder })
      .executeScript('remix.exeCurrent()')
      .pause(2000)
      .waitForElementNotPresent('[data-id="treeViewLitreeViewItemcontracts"]', 60000)
      .end()
  }
}

const executeFile = `
  const run = async () => {
    const result = await remix.call('fileManager', 'file')

    console.log(result)
  }

  run()
`

const executeExists = `
  const run = async () => {
    const result1 = await remix.call('fileManager', 'exists', 'exists.js')
    const result2 = await remix.call('fileManager', 'exists', 'non-exists.js')

    console.log('exists.js ' + result1)
    console.log('non-exists.js ' + result2)
  }

  run()
`

const executeOpen = `
  const run = async () => {
    await remix.call('fileManager', 'open', 'contracts/3_Ballot.sol')
    const result = await remix.call('fileManager', 'file')

    console.log(result)
  }

  run()
`

const executeWriteFile = `
  const run = async () => {
    await remix.call('fileManager', 'writeFile', 'new_contract.sol', 'pragma solidity ^0.6.0')
  }

  run()
`

const executeReadFile = `
  const run = async () => {
    const result = await remix.call('fileManager', 'readFile', 'new_contract.sol')

    console.log(result)
  }

  run()
`

const executeCopyFile = `
  const run = async () => {
    await remix.call('fileManager', 'copyFile', 'contracts/3_Ballot.sol', '/', 'copy_contract.sol')
    const result = await remix.call('fileManager', 'readFile', 'copy_contract.sol')

    console.log(result)
  }

  run()
`

const executeRename = `
  const run = async () => {
    await remix.call('fileManager', 'rename', 'new_contract.sol', 'old_contract.sol')
  }

  run()
`

const executeMkdir = `
  const run = async () => {
    await remix.call('fileManager', 'mkdir', 'Test_Folder/')
  }

  run()
`

const executeReaddir = `
  const run = async () => {
    const result = await remix.call('fileManager', 'readdir', '/')
    const output = result["Test_Folder"].isDirectory
    console.log('Test_Folder isDirectory ', output)
  }

  run()
`

const executeRemove = `
  const run = async () => {
    await remix.call('fileManager', 'remove', 'old_contract.sol')
  }

  run()
`

const executeRemoveOnFolder = `(async () => {
  try {      
      await remix.call('fileManager', 'remove', 'contracts')
  } catch (e) {
      console.log(e.message)
  }
})()`
