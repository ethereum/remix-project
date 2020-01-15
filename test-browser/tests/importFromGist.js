'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')

const testData = {
  validGistId: '1859c97c6e1efc91047d725d5225888e',
  invalidGistId: '6368b389f9302v32902msk2402'
}

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  'Load Gist Modal': function (browser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .scrollAndClick('div.file > div.btn-group > button:nth-child(1)')
    .waitForElementVisible('h6.modal-title')
    .assert.containsText('h6.modal-title', 'Load a Gist')
    .waitForElementVisible('div.modal-body > div')
    .assert.containsText('div.modal-body > div', 'Enter the ID of the Gist or URL you would like to load.')
    .waitForElementVisible('#prompt_text')
    .click('#modal-footer-cancel')
  },

  'Display Error Message For Invalid Gist ID': function (browser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .scrollAndClick('div.file > div.btn-group > button:nth-child(1)')
    .waitForElementVisible('#prompt_text')
    .setValue('#prompt_text', testData.invalidGistId)
    .modalFooterOKClick()
    .waitForElementVisible('div.modal-body > div')
    .assert.containsText('div.modal-body > div', 'Gist load error: Not Found')
    .modalFooterOKClick()
  },

  'Import From Gist For Valid Gist ID': function (browser) {
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .scrollAndClick('div.file > div.btn-group > button:nth-child(1)')
    .waitForElementVisible('#prompt_text')
    .setValue('#prompt_text', testData.validGistId)
    .modalFooterOKClick()
    .switchFile(`browser/gists/${testData.validGistId}`)
    .switchFile(`browser/gists/${testData.validGistId}/ApplicationRegistry`)
    .waitForElementVisible(`div[title='browser/gists/${testData.validGistId}/ApplicationRegistry']`)
    .assert.containsText(`div[title='browser/gists/${testData.validGistId}/ApplicationRegistry'] > span`, 'ApplicationRegistry')
  },

  tearDown: sauce
}
