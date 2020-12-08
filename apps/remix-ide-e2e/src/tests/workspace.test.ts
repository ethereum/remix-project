'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?activate=solidity,udapp&call=fileManager//open//contracts/3_Ballot.sol&deactivate=home', false)
  },

  'CheckSolidityActivatedAndUDapp': function (browser: NightwatchBrowser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('solidity')
    .clickLaunchIcon('udapp')    
  },

  'Editor should be focused on the 3_Ballot.sol': function (browser: NightwatchBrowser) {
    browser
    .pause(5000)
    .getEditorValue((content) => {
      browser.assert.ok(content.indexOf('contract Ballot {') != -1, 'content doesn\'t include Ballot contract')
    })    
  },

  'Home page should be deactivated': function (browser: NightwatchBrowser) {
    browser
    .waitForElementNotPresent('[data-id="landingPageHomeContainer"]')
    .end()
  },
  
  tearDown: sauce
}
