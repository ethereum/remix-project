'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },

  'Should execute `file` api from file manager external api': function (browser) {
    browser
    .addFile('file.js', { content: executeFile })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .journalLastChildIncludes('browser/file.js')
  },

  'Should execute `exists` api from file manager external api': function (browser) {
    browser
    .addFile('exists.js', { content: executeExists })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .journalChildIncludes('browser/exists.js true')
    .journalChildIncludes('browser/non-exists.js false')
  },

  'Should execute `open` api from file manager external api': function (browser) {
    browser
    .addFile('open.js', { content: executeOpen })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .journalLastChildIncludes('browser/3_Ballot.sol')
  },

  'Should execute `writeFile` api from file manager external api': function (browser) {
    browser
    .addFile('writeFile.js', { content: executeWriteFile })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .openFile('browser/new_contract.sol')
    .assert.containsText('[data-id="editorInput"]', 'pragma solidity ^0.6.0')
  },

  'Should execute `readFile` api from file manager external api': function (browser) {
    browser
    .addFile('readFile.js', { content: executeReadFile })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .journalLastChildIncludes('pragma solidity ^0.6.0')
  },

  'Should execute `copyFile` api from file manager external api': function (browser) {
    browser
    .addFile('copyFile.js', { content: executeCopyFile })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .journalLastChildIncludes('pragma solidity >=0.2.0 <0.7.0;')
  },

  'Should execute `rename` api from file manager external api': function (browser) {
    browser
    .addFile('renameFile.js', { content: executeRename })
    .executeScript(`remix.exeCurrent()`)
    .pause(2000)
    .waitForElementPresent('[data-id="treeViewLibrowser/old_contract.sol"]')
    .end()
  },

  // 'Should execute `rename` api from file manager external api': function (browser) {
  //   browser
  //   .addFile('renameFile.js', { content: executeRename })
  //   .executeScript(`remix.exeCurrent()`)
  //   .pause(2000)
  //   .waitForElementPresent('[data-id="treeViewLibrowser/new_contract.sol"]')
  //   .end()
  // },

  tearDown: sauce
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
    const result1 = await remix.call('fileManager', 'exists', 'browser/exists.js')
    const result2 = await remix.call('fileManager', 'exists', 'browser/non-exists.js')

    console.log('browser/exists.js ' + result1)
    console.log('browser/non-exists.js ' + result2)
  }

  run()
`

const executeOpen = `
  const run = async () => {
    await remix.call('fileManager', 'open', 'browser/3_Ballot.sol')
    const result = await remix.call('fileManager', 'file')

    console.log(result)
  }

  run()
`

const executeWriteFile = `
  const run = async () => {
    await remix.call('fileManager', 'writeFile', 'browser/new_contract.sol', 'pragma solidity ^0.6.0')
  }

  run()
`

const executeReadFile = `
  const run = async () => {
    const result = await remix.call('fileManager', 'readFile', 'browser/new_contract.sol')

    console.log(result)
  }

  run()
`

const executeCopyFile = `
  const run = async () => {
    await remix.call('fileManager', 'copyFile', 'browser/basic.sol', 'browser/new_contract.sol')
    const result = await remix.call('fileManager', 'readFile', 'browser/new_contract.sol')

    console.log(result)
  }

  run()
`

const executeRename = `
  const run = async () => {
    const result = await remix.call('fileManager', 'rename', 'browser/new_contract.sol', 'browser/old_contract.sol')

    console.log('result: ', result)
  }

  run()
`