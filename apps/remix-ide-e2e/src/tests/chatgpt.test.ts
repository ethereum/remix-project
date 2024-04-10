'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?plugins=solidity,udapp', false)
  },
  'Should ask a simple chat gpt question #group1 #flaky': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="terminalCli"]', 10000)
      .executeScriptInTerminal('gpt Hello, my name is John and I am a')
      .pause(2000)
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'assistent', 60000)
  },
}