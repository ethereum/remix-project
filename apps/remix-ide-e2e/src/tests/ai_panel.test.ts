'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import examples from '../examples/example-contracts'

const sources = [
  { 'Untitled.sol': { content: examples.ballot.content } }
]

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Add Ballot': function (browser: NightwatchBrowser) {
    browser
      .addFile('Untitled.sol', sources[0]['Untitled.sol'])
  },
  'Explain the contract': function (browser: NightwatchBrowser) {
    browser
        .waitForElementVisible('*[data-id="explain-editor"]')
        .click('*[data-id="explain-editor"]')
        .waitForElementVisible('*[data-id="popupPanelPluginsContainer"]')
        .waitForElementVisible('*[data-id="aichat-view"]')
        .waitForElementVisible({
            locateStrategy: 'xpath',
            selector: '//*[@data-id="aichat-view" and contains(.,"Explain the current code")]'
        })
  },
  'close the popup': function (browser: NightwatchBrowser) {
    browser
        .waitForElementVisible('*[data-id="popupPanelToggle"]')
        .click('*[data-id="popupPanelToggle"]')
        .waitForElementNotVisible('*[data-id="popupPanelPluginsContainer"]')
  },
  'Add a bad contract': function (browser: NightwatchBrowser) {
    browser
        .addFile('Bad.sol', { content: 'errors' })
        .clickLaunchIcon('solidity')
        .waitForElementVisible('.ask-remix-ai-button')
        .click('.ask-remix-ai-button')
        .waitForElementVisible('*[data-id="popupPanelPluginsContainer"]')
        .waitForElementVisible('*[data-id="aichat-view"]')
        .waitForElementVisible({
            locateStrategy: 'xpath',
            selector: '//*[@data-id="aichat-view" and contains(.,"Explain the error")]'
        })
  }
}