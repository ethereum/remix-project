'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return []
  },
  'Publish on IPFS': function (browser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .switchFile('browser/3_Ballot.sol')
    .verifyContracts(['Ballot'])
    .click('#publishOnIpfs')
    .getModalBody((value, done) => {
      if (value.indexOf('Metadata published successfully.') === -1) browser.assert.fail('ipfs deploy failed', '', '')
      if (value.indexOf('dweb:/ipfs') === -1) browser.assert.fail('ipfs deploy failed', '', '')
      done()
    })
    .modalFooterOKClick()
  },
  'Publish on Swarm': function (browser) {
    browser
    .click('#publishOnSwarm')
    .getModalBody((value, done) => {
      if (value.indexOf('Metadata published successfully.') === -1) browser.assert.fail('swarm deploy failed', '', '')
      if (value.indexOf('bzz') === -1) browser.assert.fail('swarm deploy failed', '', '')
      done()
    })
    .end()
  },
  tearDown: sauce
}
