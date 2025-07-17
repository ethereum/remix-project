'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import examples from '../examples/example-contracts'

const sources = [
  { 'Untitled.sol': { content: examples.ballot.content } }
]

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return []
  },

  'Compile using the widget #group1': function (browser: NightwatchBrowser) {
    browser
      .openFile('contracts/3_Ballot.sol')
      .click('[data-id="compile-action"]')
      .pause()
      .waitForElementVisible('[data-id="compile_group"] i.fa-check', 10000)
      .verifyContracts(['Ballot'])
  }
}