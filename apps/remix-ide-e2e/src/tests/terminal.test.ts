'use strict'
import { NightwatchBrowser } from "nightwatch"
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
  },

  'Should execution a simple console command': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]', 10000)
    .executeScript('console.log(1 + 1)')
    .journalLastChild('2')
  },

  'Should clear console': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]')
    .journalChildIncludes('Welcome to Remix')
    .click('#clearConsole')
    .assert.containsText('*[data-id="terminalJournal"]', '')
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
    .journalChildIncludes('remix.loadgist(id)')
    .journalChildIncludes('remix.loadurl(url)')
    .journalChildIncludes('remix.execute(filepath)')
    .journalChildIncludes('remix.exeCurrent()')
    .journalChildIncludes('remix.help()')
  },

  'Async/Await Script': function (browser: NightwatchBrowser) {
    browser
    .addFile('asyncAwait.js', { content: asyncAwait })
    .openFile('browser/asyncAwait.js')
    .executeScript(`remix.execute('browser/asyncAwait.js')`)
    .pause(5500)
    .journalLastChild('Waiting Promise')
    .pause(10500)
    .journalLastChild('result - Promise Resolved')
  },

  'Call Remix File Manager from a script': function (browser: NightwatchBrowser) {
    browser
    .addFile('asyncAwaitWithFileManagerAccess.js', { content: asyncAwaitWithFileManagerAccess })
    .openFile('browser/asyncAwaitWithFileManagerAccess.js')
    .pause(5000)
    .executeScript(`remix.execute('browser/asyncAwaitWithFileManagerAccess.js')`)
    .pause(6000)
    .journalLastChildIncludes('contract Ballot {')
    .end()
  },

  tearDown: sauce
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
    let text = await remix.call('fileManager', 'readFile', 'browser/3_Ballot.sol')
    console.log('result - ', text)
  }

  run()
`
