'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
  },

  'Should execution a simple console command': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]', 10000)
      .executeScript('console.log(1 + 1)')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '2', 60000)
  },

  'Should clear console': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .journalChildIncludes('Welcome to Remix')
      .click('#clearConsole')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '', 60000)
  },

  'Should display auto-complete menu': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .click('*[data-id="terminalCli"]')
      .sendKeys('*[data-id="terminalCliInput"]', 'remix.')
      .assert.visible('*[data-id="autoCompletePopUpAutoCompleteItem"]')
  },

  'Should execute remix.help() command': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]')
      .executeScript('remix.help()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.loadgist(id)', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.loadurl(url)', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.execute(filepath)', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.exeCurrent()', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'remix.help()', 60000)
  },

  'Async/Await Script': function (browser: NightwatchBrowser) {
    browser
      .addFile('asyncAwait.js', { content: asyncAwait })
      .openFile('asyncAwait.js')
      .executeScript('remix.execute(\'asyncAwait.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Waiting Promise', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'result - Promise Resolved', 60000)
  },

  'Call Remix File Manager from a script': function (browser: NightwatchBrowser) {
    browser
      .addFile('asyncAwaitWithFileManagerAccess.js', { content: asyncAwaitWithFileManagerAccess })
      .openFile('asyncAwaitWithFileManagerAccess.js')
      .pause(5000)
      .executeScript('remix.execute(\'asyncAwaitWithFileManagerAccess.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'contract Ballot {', 60000)
  },

  'Call web3.eth.getAccounts() using JavaScript VM': function (browser: NightwatchBrowser) {
    browser
      .executeScript('web3.eth.getAccounts()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '"0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c", "0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C", "0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB", "0x583031D1113aD414F02576BD6afaBfb302140225", "0xdD870fA1b7C4700F2BD7f44238821C26f7392148"', 80000)
  },

  'Call web3.eth.getAccounts() using Web3 Provider': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .clickLaunchIcon('udapp')
      .click('*[data-id="settingsWeb3Mode"]')
      .modalFooterOKClick()
      .executeScript('web3.eth.getAccounts()')
      .waitForElementContainsText('*[data-id="terminalJournal"]', '[ "', 60000) // we check if an array is present, don't need to check for the content
      .waitForElementContainsText('*[data-id="terminalJournal"]', '" ]', 60000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', '", "', 60000)
  },

  'Call Remix File Resolver (external URL) from a script': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('resolveExternalUrlAndSave.js', { content: resolveExternalUrlAndSave })
      .openFile('resolveExternalUrlAndSave.js')
      .pause(1000)
      .executeScript('remix.execute(\'resolveExternalUrlAndSave.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Implementation of the {IERC20} interface.', 60000)
      .openFile('.deps/github/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol')
  },

  'Call Remix File Resolver (internal URL) from a script': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('resolveUrl.js', { content: resolveUrl })
      .openFile('resolveUrl.js')
      .pause(1000)
      .executeScript('remix.execute(\'resolveUrl.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'contract Ballot {', 60000)
  },

  'Call Remix File Resolver (internal URL) from a script and specify a path': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="terminalClearConsole"]') // clear the terminal
      .addFile('resolveExternalUrlAndSaveToaPath.js', { content: resolveExternalUrlAndSaveToaPath })
      .openFile('resolveExternalUrlAndSaveToaPath.js')
      .pause(1000)
      .executeScript('remix.execute(\'resolveExternalUrlAndSaveToaPath.js\')')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'abstract contract ERC20Burnable', 60000)
      .openFile('.deps/github/newFile.sol')
      .end()
  }
}

const asyncAwait = `
  var p = function () {
    return new Promise(function (resolve, reject)  {
        setTimeout(function ()  {
            resolve("Promise Resolved")
        }, 5000)
    })
  } 

  var run = async () => {
    console.log('Waiting Promise')
    var result = await p()
    console.log('result - ', result)
  }

  run()
`

const asyncAwaitWithFileManagerAccess = `
  var p = function () {
    return new Promise(function (resolve, reject)  {
        setTimeout(function ()  {
            resolve("Promise Resolved")
        }, 0)
    })
  }

  var run = async () => {
    console.log('Waiting Promise')
    var result = await p()
    let text = await remix.call('fileManager', 'readFile', 'contracts/3_Ballot.sol')
    console.log('result - ', text)
  }

  run()
`

const resolveExternalUrlAndSave = `
(async () => {
  try {
      console.log('start')
      console.log(await remix.call('contentImport', 'resolveAndSave', 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol'))
  } catch (e) {
      console.log(e.message)
  }
})()  
`

const resolveExternalUrlAndSaveToaPath = `
(async () => {
  try {
      console.log('start')
      console.log(await remix.call('contentImport', 'resolveAndSave', 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol', 'github/newFile.sol'))
  } catch (e) {
      console.log(e.message)
  }
})()  
`

const resolveUrl = `
(async () => {
  try {
      console.log('start')
      console.log(await remix.call('contentImport', 'resolveAndSave', 'contracts/3_Ballot.sol'))
  } catch (e) {
      console.log(e.message)
  }
})()  
`
