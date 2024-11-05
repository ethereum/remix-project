import { NightwatchBrowser } from 'nightwatch'


module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    done()
  },
  'open default template': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('button[data-id="landingPageImportFromTemplate"]')
      .click('button[data-id="landingPageImportFromTemplate"]')
      .waitForElementPresent('*[data-id="create-remixDefault"]')
      .scrollAndClick('*[data-id="create-remixDefault"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementPresent('[data-id="TemplatesSelectionModalDialogContainer-react"] .modal-ok')
      .click('[data-id="TemplatesSelectionModalDialogContainer-react"] .modal-ok')
      .pause(3000)
      .windowHandles(function (result) {
        console.log(result.value)
        browser.switchWindow(result.value[1])
        .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
        .click('*[data-id="treeViewLitreeViewItemtests"]')
        .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
        .click('*[data-id="treeViewLitreeViewItemcontracts"]')
        .waitForElementVisible('[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
        .openFile('contracts/1_Storage.sol')
        .waitForElementVisible('*[id="editorView"]', 10000)
        .getEditorValue((content) => {
          browser.assert.ok(content.includes('function retrieve() public view returns (uint256){'))
        })
      })
      .end()
  }
}