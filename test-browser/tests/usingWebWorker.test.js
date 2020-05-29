'use strict'
var examples = require('../../src/app/editor/example-contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var sources = [
  {'browser/basic.sol': {content: examples.basic.content}}
]

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Using Web Worker': function (browser) {
    browser
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .addFile('basic.sol', sources[0]['browser/basic.sol'])
    .noWorkerErrorFor('soljson-v0.3.4+commit.7dab890.js')
    .noWorkerErrorFor('soljson-v0.6.5+commit.f956cc89.js')
    .noWorkerErrorFor('soljson-v0.6.8-nightly.2020.5.14+commit.a6d0067b.js')
    .noWorkerErrorFor('soljson-v0.6.0-nightly.2019.12.17+commit.d13438ee.js')
    .noWorkerErrorFor('soljson-v0.4.26+commit.4563c3fc.js')
  },

  tearDown: sauce
}
