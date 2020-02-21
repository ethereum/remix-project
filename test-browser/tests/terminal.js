'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
  },

  'Should execution a simple console command': function (browser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]', 10000)
    .executeScript('1+1')
    .journalLastChild('2')
  },

  'Should clear console': function (browser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]')
    .journalChildIncludes('Welcome to Remix')
    .click('#clearConsole')
    .assert.containsText('*[data-id="terminalJournal"]', '')
  },

  'Should display auto-complete menu': function (browser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]')
    .click('*[data-id="terminalCli"]')
    .keys('remix.')
    .assert.visible('*[data-id="autoCompletePopUpAutoCompleteItem"]')
  },

  'Should execute remix.help() command': function (browser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]')
    .executeScript('remix.help()')
    .journalChildIncludes('remix.call(message: {name, key, payload})')
    .journalChildIncludes('remix.getFile(path)')
    .journalChildIncludes('remix.debug(hash)')
    .journalChildIncludes('remix.loadgist(id)')
    .journalChildIncludes('remix.loadurl(url)')
    .journalChildIncludes('remix.setproviderurl(url)')
    .journalChildIncludes('remix.execute(filepath)')
    .journalChildIncludes('remix.exeCurrent()')
    .journalChildIncludes('remix.help()')
    .journalChildIncludes('remix.debugHelp()')
  },

  'Should execute remix.debugHelp() command': function (browser) {
    browser
    .waitForElementVisible('*[data-id="terminalCli"]')
    .executeScript('remix.debugHelp()')
    .journalChildIncludes('Here are some examples of scripts that can be run (using remix.exeCurrent() or directly from the console)')
    .journalChildIncludes('Please see https://www.npmjs.com/package/remix-debug for more informations')
    .end()
  },

  tearDown: sauce
}
