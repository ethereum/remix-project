'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const testData = {
  validGistId: '1859c97c6e1efc91047d725d5225888e',
  invalidGistId: '6368b389f9302v32902msk2402'
}
// 99266d6da54cc12f37f11586e8171546c7700d67

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  UploadToGists: function (browser: NightwatchBrowser) {
    /*
       - set the access token
       - publish to gist
       - retrieve the gist
       - switch to a file in the new gist
      */
    console.log('token', process.env.gist_token)

    browser
      .refresh()
      .pause(10000)
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .click('li[data-id="treeViewLitreeViewItemREADME.txt"]') // focus on root directory
      .waitForElementVisible('*[data-id="fileExplorerNewFilecreateNewFolder"]')
      .click('[data-id="fileExplorerNewFilecreateNewFolder"]')
      .pause(1000)
      .waitForElementVisible('*[data-id$="/blank"]')
      .sendKeys('*[data-id$="/blank"] .remixui_items', 'Browser_Tests')
      .sendKeys('*[data-id$="/blank"] .remixui_items', browser.Keys.ENTER)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemBrowser_Tests"]')
      .addFile('File.sol', { content: '' })
      .click('*[data-id="fileExplorerNewFilepublishToGist"]')
      .pause(2000)
      .waitForElementVisible('*[data-id="default_workspaceModalDialogContainer-react"]')
      .click('*[data-id="default_workspaceModalDialogContainer-react"] .modal-ok')
      .pause(10000)
      .getText('[data-id="default_workspaceModalDialogModalBody-react"]', (result) => {
        console.log(result)
        const value = typeof result.value === 'string' ? result.value : null
        const reg = /gist.github.com\/([^.]+)/
        const id = value.match(reg)

        console.log('gist regex', id)
        if (!id) {
          browser.assert.fail('cannot get the gist id', '', '')
        } else {
          const gistid = id[1]
          browser
            .click('[data-id="default_workspace-modal-footer-cancel-react"]')
            .executeScript(`remix.loadgist('${gistid}')`)
            // .perform((done) => { if (runtimeBrowser === 'chrome') { browser.openFile('gists') } done() })
            .waitForElementVisible(`[data-id="treeViewLitreeViewItem${gistid}"]`)
            .click(`[data-id="treeViewLitreeViewItem${gistid}"]`)
            .openFile(`${gistid}/README.txt`)
        }
      })
  },

  'Load Gist Modal': function (browser: NightwatchBrowser) {
    browser.clickLaunchIcon('home')
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .scrollAndClick('*[data-id="landingPageImportFromGistButton"]')
      .waitForElementVisible('*[data-id="modalDialogModalTitle"]')
      .assert.containsText('*[data-id="modalDialogModalTitle"]', 'Load a Gist')
      .waitForElementVisible('*[data-id="modalDialogModalBody"]')
      .assert.containsText('*[data-id="modalDialogModalBody"]', 'Enter the ID of the Gist or URL you would like to load.')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptText"]')
      .modalFooterCancelClick()
  },

  'Display Error Message For Invalid Gist ID': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('filePanel')
      .scrollAndClick('*[data-id="landingPageImportFromGistButton"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptText"]')
      .setValue('*[data-id="modalDialogCustomPromptText"]', testData.invalidGistId)
      .modalFooterOKClick()
      .waitForElementVisible('*[data-id="modalDialogModalBody"]')
      .assert.containsText('*[data-id="modalDialogModalBody"]', 'Not Found')
      .modalFooterOKClick()
  },

  'Display Error Message For Missing Gist Token When Publishing': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('settings')
      .waitForElementVisible('[data-id="settingsTabRemoveGistToken"]')
      .click('[data-id="settingsTabRemoveGistToken"]')
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('*[data-id="fileExplorerNewFilepublishToGist"]')
      .click('*[data-id="fileExplorerNewFilepublishToGist"]')
      .waitForElementVisible('*[data-id="default_workspaceModalDialogContainer-react"]')
      .pause(2000)
      .click('*[data-id="default_workspaceModalDialogContainer-react"] .modal-ok')
      .pause(10000)
      .getText('[data-id="default_workspaceModalDialogModalBody-react"]', (result) => {
        browser.assert.ok(result.value === 'Remix requires an access token (which includes gists creation permission). Please go to the settings tab to create one.', 'Assert failed. Gist token error message not displayed.')
      })
      .click('[data-id="default_workspace-modal-footer-ok-react"]')
  },

  'Import From Gist For Valid Gist ID': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .clickLaunchIcon('settings')
      .click('*[data-id="settingsTabGenerateContractMetadataLabel"]')
      .setValue('[data-id="settingsTabGistAccessToken"]', process.env.gist_token)
      .click('[data-id="settingsTabSaveGistToken"]')
      .clickLaunchIcon('filePanel')
      .scrollAndClick('*[data-id="landingPageImportFromGistButton"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptText"]')
      .setValue('*[data-id="modalDialogCustomPromptText"]', testData.validGistId)
      .modalFooterOKClick()
      .openFile(`${testData.validGistId}/ApplicationRegistry`)
      .waitForElementVisible(`div[title='default_workspace/${testData.validGistId}/ApplicationRegistry']`)
      .assert.containsText(`div[title='default_workspace/${testData.validGistId}/ApplicationRegistry'] > span`, 'ApplicationRegistry')
      .end()
  }
}
