import { NightwatchBrowser } from 'nightwatch'


module.exports = {
  '@isogit': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    done()
  },
  'clone a repo': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
      .waitForElementVisible('button[data-id="landingPageImportFromGit"]')
      .click('button[data-id="landingPageImportFromGit"]')
      .pause(1000)
      .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
      .click('[data-id="fileSystemModalDialogModalBody-react"]')
      .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
      .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
      .click('[data-id="fileSystem-modal-footer-ok-react"]')
      .pause(3000)
      .windowHandles(function (result) {
        console.log(result.value)
        browser.switchWindow(result.value[1])
        .waitForElementVisible('*[data-id="treeViewLitreeViewItem.git"]')
      })
      .end()
  }
}