'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?e2e_testmigration=true', false)
  },
  'Should have README file with TEST README as content': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]', 5000)
      .click('*[data-id="verticalIconsFileExplorerIcons"]')
      .openFile('TEST_README.txt')
      .getEditorValue((content) => {
        browser.assert.equal(content, 'TEST README')
      })
  },
  'Should have a workspace_test': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]', 5000)
      .click('*[data-id="workspacesSelect"] option[value="workspace_test"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest_contracts"]')
  },
  'Should have a sol file with test data': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]', 5000)
      .click('*[data-id="treeViewLitreeViewItemtest_contracts"]')
      .openFile('test_contracts/1_Storage.sol')
      .getEditorValue((content) => {
        browser.assert.equal(content, 'testing')
      })
  },
  'Should have a artifacts file with JSON test data': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]', 5000)
      .click('*[data-id="treeViewLitreeViewItemtest_contracts/artifacts"]')
      .openFile('test_contracts/artifacts/Storage_metadata.json')
      .getEditorValue((content) => {
        const metadata = JSON.parse(content)
        browser.assert.equal(metadata.test, 'data')
      })
  }
}
