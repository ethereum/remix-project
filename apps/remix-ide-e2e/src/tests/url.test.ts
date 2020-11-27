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
    .assert.containsText('#evmVersionSelector option[selected="selected"]', 'istanbul')
    .verify.elementPresent('#optimize:checked')
  },

  'Should load using compiler from link passed in remix URL': function (browser: NightwatchBrowser) {
    browser
    .url('http://127.0.0.1:8080/#version=https://solidity-blog.s3.eu-central-1.amazonaws.com/data/08preview/soljson.js')
    .refresh()
    .pause(5000)
    .clickLaunchIcon('solidity')
    .pause(5000)
    .assert.containsText('#versionSelector option[selected="selected"]', 'custom')
    // default values
    .verify.elementPresent('#optimize')
    .assert.elementNotPresent('#optimize:checked')
    .assert.containsText('#evmVersionSelector option[selected="selected"]', 'default')
    .end()
  },

  tearDown: sauce
}