'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'
import examples from '../examples/example-contracts'

const sources = [
  {'browser/Untitled.sol': { content: examples.ballot.content }}
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080/#optimize=true&runs=300&evmVersion=istanbul&version=soljson-v0.7.4+commit.3f05b770.js')
  },
  
  '@sources': function () {
    return sources
  },

  'Should load using URL compiler params': function (browser: NightwatchBrowser) {
    browser
    .assert.containsText('#versionSelector option[selected="selected"]', '0.7.4+commit.3f05b770')
    // .assert.containsText('#evmVersionSelector option[selected="selected"]', 'istanbul')
    .verify.elementPresent('[id="optimize"]:checked')
  },

  tearDown: sauce
}