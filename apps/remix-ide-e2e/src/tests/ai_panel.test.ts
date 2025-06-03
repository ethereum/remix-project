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
  'Should explain the contract': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="explain-editor"]')
      .click('*[data-id="explain-editor"]')
      .waitForElementVisible('*[data-id="remix-ai-assistant"]')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and contains(.,"Explain the current code")]'
      })
      .pause(20000)
  },
  'Should add a bad contract and explain using RemixAI': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .addFile('Bad.sol', { content: 'errors' })
      .clickLaunchIcon('solidity')
      .waitForElementVisible('.ask-remix-ai-button')
      .click('.ask-remix-ai-button')
      .waitForElementVisible('*[data-id="remix-ai-assistant"]')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and contains(.,"Explain the error")]'
      })
      .pause(20000)
  },
  'Should select the AI assistant provider': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="remix-ai-assistant"]')
      .assistantSetProvider('mistralai')
  },
  'Should add current file as context to the AI assistant': function (browser: NightwatchBrowser) {
    browser
      .addFile('Untitled.sol', sources[0]['Untitled.sol'])
      .openFile('Untitled.sol')
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="remix-ai-assistant"]')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantAddContext('currentFile')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: `//*[@data-id="composer-context-holder" and contains(.,"Untitled.sol")]`
      })
  },
  'Should add workspace as context to the AI assistant': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantAddContext('workspace')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="composer-context-holder" and contains(.,"@workspace")]'
      })
  },
  'Should add opened files as context to the AI assistant': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .addFile('anotherFile.sol', sources[0]['Untitled.sol'])
      .assistantAddContext('openedFiles')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="composer-context-holder" and contains(.,"anotherFile.sol")]'
      })
  },
  'Should generate new workspace contract code with the AI assistant': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantGenerate('a simple ERC20 contract', 'mistralai')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and contains(.,"New workspace created:")]'
      }, 60000)
  },
  'Should lead to Workspace generation with the AI assistant': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantWorkspace('comment all function', 'mistralai')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and (contains(.,"Modified Files") or contains(.,"No Changes applied"))]'
      }, 60000)
  },
  'Should create a new workspace using the AI assistant button in the composer': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="remix-ai-assistant"]')
      .waitForElementVisible('*[data-id="composer-ai-workspace-generate"]')
      .click('*[data-id="composer-ai-workspace-generate"]')
      .waitForElementVisible('*[data-id="TemplatesSelectionModalDialogModalBody-react"]')
      .click('*[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="modalDialogCustomPromptTextCreate"]', 'a simple ERC20 contract')
      .click('*[data-id="TemplatesSelection-modal-footer-ok-react"]')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and contains(.,"New workspace created:")]'
      }, 6000)
  },
  'Workspace generation with all AI assistant provider': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantWorkspace('remove all comments', 'openai')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and (contains(.,"Modified Files") or contains(.,"No Changes applied"))]'
      }, 60000)
      .pause(20000)
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantWorkspace('remove all comments', 'anthropic')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and (contains(.,"Modified Files") or contains(.,"No Changes applied"))]'
      }, 60000)
      .pause(20000)

  },
  'Generate new workspaces code with all AI assistant providers': function (browser: NightwatchBrowser) {
    browser
      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantGenerate('a simple ERC20 contract', 'openai')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and contains(.,"New workspace created:")]'
      }, 60000)
      .pause(20000)

      .refreshPage()
      .clickLaunchIcon('remixaiassistant')
      .waitForElementVisible('*[data-id="composer-textarea"]')
      .assistantGenerate('a simple ERC20 contract', 'anthropic')
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="remix-ai-assistant" and contains(.,"New workspace created:")]'
      }, 60000)
  },
  "Should close the AI assistant": function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remix-ai-assistant"]')
      .click('*[data-id="movePluginToLeft"]')
      .clickLaunchIcon('filePanel')
      .waitForElementNotVisible('*[data-id="remix-ai-assistant"]', 5000)
  },
}