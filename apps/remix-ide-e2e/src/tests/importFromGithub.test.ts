'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const testData = {
  validURL: 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol',
  invalidURL: 'https://github.com/Oppelin/Roles.sol',
  JSON: 'https://github.com/ethereum/remix-project/blob/master/package.json'
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Import from GitHub Modal #group1': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('home')
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .click('div[title="home"]')
      .waitForElementVisible('button[data-id="landingPageImportFromGitHubButton"]')
      .pause(1000)
      .click('button[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('*[data-id="homeTabModalDialogModalTitle-react"]')
      .assert.containsText('*[data-id="homeTabModalDialogModalTitle-react"]', 'Import from GitHub')
      .waitForElementVisible('*[data-id="homeTabModalDialogModalBody-react"]')
      .assert.containsText('*[data-id="homeTabModalDialogModalBody-react"]', 'Enter the github URL you would like to load.')
      .waitForElementVisible('input[data-id="homeTabModalDialogCustomPromptText"]')
  },

  'Display Error Message For Invalid GitHub URL Modal #group1': function (browser: NightwatchBrowser) {
    browser
      .execute(() => {
        (document.querySelector('input[data-id="homeTabModalDialogCustomPromptText"]') as any).focus()
      }, [], () => { })
      .setValue('input[data-id="homeTabModalDialogCustomPromptText"]', testData.invalidURL)
      .waitForElementVisible('*[data-id="homeTab-modal-footer-ok-react"]')
      .click('[data-id="homeTab-modal-footer-ok-react"]') // submitted
      .waitForElementVisible('*[data-shared="tooltipPopup"]')
      .assert.containsText('*[data-shared="tooltipPopup"] span', 'not found ' + testData.invalidURL)
  },

  'Import From GitHub For Valid URL #group2': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .click('div[title="home"]')
      .waitForElementVisible('button[data-id="landingPageImportFromGitHubButton"]').pause(1000)
      .click('button[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('input[data-id="homeTabModalDialogCustomPromptText"]')
      .execute(() => {
        (document.querySelector('input[data-id="homeTabModalDialogCustomPromptText"]') as any).focus()
      }, [], () => { })
      .clearValue('input[data-id="homeTabModalDialogCustomPromptText"]').pause(1000)
      .setValue('input[data-id="homeTabModalDialogCustomPromptText"]', testData.validURL)
      .waitForElementVisible('*[data-id="homeTab-modal-footer-ok-react"]')
      .click('[data-id="homeTab-modal-footer-ok-react"]')
      .openFile('github/OpenZeppelin/openzeppelin-solidity/contracts/access/Roles.sol')
      .waitForElementVisible("div[title='default_workspace/github/OpenZeppelin/openzeppelin-solidity/contracts/access/Roles.sol'")
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('library Roles {') !== -1, 'content does contain "library Roles {"')
      })
  },
  'Import JSON From GitHub For Valid URL #group2': function (browser: NightwatchBrowser) {
    browser
      .click('div[title="home"]')
      .click('button[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('input[data-id="homeTabModalDialogCustomPromptText"]').pause(1000)
      .execute(() => {
        (document.querySelector('input[data-id="homeTabModalDialogCustomPromptText"]') as any).focus()
      }, [], () => { })
      .clearValue('input[data-id="homeTabModalDialogCustomPromptText"]').pause(1000)
      .setValue('input[data-id="homeTabModalDialogCustomPromptText"]', testData.JSON)
      .waitForElementVisible('*[data-id="homeTab-modal-footer-ok-react"]')
      .click('[data-id="homeTab-modal-footer-ok-react"]')
      .openFile('github/ethereum/remix-project/package.json')
      .waitForElementVisible("div[title='default_workspace/github/ethereum/remix-project/package.json'")
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('"name": "remix-project",') !== -1, 'content does contain "name": "remix-project"')
      })
      .end()
  }
}
