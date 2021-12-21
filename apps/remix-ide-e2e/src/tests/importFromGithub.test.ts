'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const testData = {
  validURL: 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol',
  invalidURL: 'https://github.com/Oppelin/Roles.sol'
}

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Import from GitHub Modal': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('home')
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .click('div[title="home"]')
      .waitForElementVisible('button[data-id="landingPageImportFromGitHubButton"]')
      .pause(1000)
      .scrollAndClick('button[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('*[data-id="modalDialogModalTitle"]')
      .assert.containsText('*[data-id="modalDialogModalTitle"]', 'Import from Github')
      .waitForElementVisible('*[data-id="modalDialogModalBody"]')
      .assert.containsText('*[data-id="modalDialogModalBody"]', 'Enter the github URL you would like to load.')
      .waitForElementVisible('*[data-id="importModalDialogCustomPromptText"]')
      .modalFooterCancelClick()
  },

  'Display Error Message For Invalid GitHub URL Modal': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .scrollAndClick('*[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('*[data-id="importModalDialogCustomPromptText"]')
      .setValue('*[data-id="importModalDialogCustomPromptText"]', testData.invalidURL)
      .modalFooterOKClick()
      .waitForElementVisible('*[data-id="modalDialogModalBody"]')
      .assert.containsText('*[data-id="modalDialogModalBody"]', 'Not Found')
      .modalFooterOKClick()
  },

  'Import From Github For Valid URL': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('settings')
      .clickLaunchIcon('filePanel')
      .scrollAndClick('*[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('*[data-id="importModalDialogCustomPromptText"]')
      .setValue('*[data-id="importModalDialogCustomPromptText"]', testData.validURL)
      .modalFooterOKClick()
      .openFile('default_workspace/github/OpenZeppelin/openzeppelin-solidity/contracts/access/Roles.sol')
      .waitForElementVisible("div[title='default_workspace/github/OpenZeppelin/openzeppelin-solidity/contracts/access/Roles.sol'")
      .end()
  }
}
