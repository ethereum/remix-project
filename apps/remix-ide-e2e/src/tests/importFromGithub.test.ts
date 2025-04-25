'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const testData = {
  validURL: 'https://github.com/remix-project-org/git-hometab-test.git',
  invalidURL: 'https://github.com/Oppelin/Roles.sol',
  JSON: 'https://github.com/remix-project-org/git-hometab-test.git'
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
      .click('div[data-id="verticalIconsHomeIcon"]')
      .waitForElementVisible('button[data-id="landingPageImportFromGitHubButton"]')
      .pause(1000)
      .click('button[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('*[data-id="fileSystemModalDialogModalTitle-react"]')
      .assert.containsText('*[data-id="fileSystemModalDialogModalTitle-react"]', 'Clone Git Repository')
      .waitForElementVisible('*[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('input[data-id="modalDialogCustomPromptTextClone"]')
  },

  'Display Error Message For Invalid GitHub URL Modal #group1': function (browser: NightwatchBrowser) {
    browser
      .execute(() => {
        (document.querySelector('input[data-id="modalDialogCustomPromptTextClone"]') as any).focus()
      }, [], () => { })
      .setValue('input[data-id="modalDialogCustomPromptTextClone"]', testData.invalidURL)
      .waitForElementVisible('*[data-id="fileSystemModalDialogModalFooter-react"]')
      .click('[data-id="fileSystem-modal-footer-ok-react"]') // submitted
      //.waitForElementVisible('*[data-shared="tooltipPopup"]')
      //.waitForElementContainsText('*[data-shared="tooltipPopup"] span', 'not found ' + testData.invalidURL)
  },

  'Clone From GitHub with Valid URL #group2': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .click('div[data-id="verticalIconsHomeIcon"]')
      .waitForElementVisible('button[data-id="landingPageImportFromGitHubButton"]').pause(1000)
      .click('button[data-id="landingPageImportFromGitHubButton"]')
      .waitForElementVisible('input[data-id="modalDialogCustomPromptTextClone"]')
      .execute(() => {
        (document.querySelector('input[data-id="modalDialogCustomPromptTextClone"]') as any).focus()
      }, [], () => { })
      .clearValue('input[data-id="modalDialogCustomPromptTextClone"]').pause(1000)
      .setValue('input[data-id="modalDialogCustomPromptTextClone"]', testData.validURL)
      .waitForElementVisible('*[data-id="fileSystem-modal-footer-ok-react"]')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .openFile('Roles.sol')
      .waitForElementVisible({
        selector: `//*[@data-id='tab-active' and @data-path="git-hometab-test.git/Roles.sol"]`,
        locateStrategy: 'xpath'
      })
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('library Roles {') !== -1, 'content does contain "library Roles {"')
      })
  },
  'Confirm JSON After Cloning From GitHub For Valid URL #group2': function (browser: NightwatchBrowser) {
    browser
      .click('div[data-id="verticalIconsHomeIcon"]')
      .openFile('package.json')
      .waitForElementVisible("*[data-path='git-hometab-test.git/package.json']")
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('"name": "remix-project",') !== -1, 'content does contain "name": "remix-project"')
      })
      .end()
  }
}
