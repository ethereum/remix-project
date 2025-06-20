import { NightwatchBrowser } from 'nightwatch'


module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    done()
  },
  'open default template': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('*[data-id="createWorkspaceButton"]')
      .click('*[data-id="createWorkspaceButton"]')
      .waitForElementPresent('*[data-id="create-remixDefault"]')
      .scrollAndClick('*[data-id="create-remixDefault"]')
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
  },
  'open template explorer and add template to current': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="workspacesMenuDropdown"]', 10000)
      .click('*[data-id="workspacesMenuDropdown"]')
      .waitForElementVisible('*[data-id="workspacecreate.desktop"]')
      .click('*[data-id="workspacecreate.desktop"]')
      .waitForElementVisible('*[data-id="add-simpleEip7702"]')
      .scrollAndClick('*[data-id="add-simpleEip7702"]')
      .waitForElementVisible('*[data-id="treeViewDivtreeViewItemcontracts/Example7702.sol"]')
  }
}