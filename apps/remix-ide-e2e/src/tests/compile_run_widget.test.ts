'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': function () {
    return []
  },

  'Compile using the widget #group1': function (browser: NightwatchBrowser) {
    browser
      .openFile('contracts/3_Ballot.sol')
      .click('[data-id="compile-action"]')
      .waitForElementVisible('[data-id="compile_group"] i.fa-check', 60000)
      .verifyContracts(['Ballot'])
  },

  'Run script using the widget #group2': function (browser: NightwatchBrowser) {
    browser
      .openFile('scripts/deploy_with_web3.ts')
      .click('[data-id="compile-action"]')
      .waitForElementVisible('[data-id="compile_group"] i.fa-check', 60000)
  },

  'Should activate Solidity Static Analysis and show "Solidity Analyzers" title from compile dropdown #group3': function (browser: NightwatchBrowser) {
    browser
      .openFile('contracts/3_Ballot.sol')
      .click('[data-id="compile-dropdown-trigger"]')
      .waitForElementVisible('[data-id="compile-dropdown-panel"]', 60000)
      .click('[data-id="compile-run-analysis-menu-item"]')
      .waitForElementVisible('[data-id="compile-run-analysis-menu-item-panel"]', 60000)
      .click('[data-id="run-remix-analysis-submenu-item"]')
      .waitForElementVisible('#icon-panel div[plugin="solidityStaticAnalysis"]', 60000)
      .waitForElementVisible('[data-id="sidePanelSwapitTitle"]', 60000)
      .assert.textContains('[data-id="sidePanelSwapitTitle"]', 'SOLIDITY ANALYZERS', 'Solidity Analyzers title should be visible.')
      .waitForElementVisible('#side-panel', 60000)
      .verifyContracts(['Ballot'])
  },

  'Should run Solidity Scan and display results in terminal #group4': function (browser: NightwatchBrowser) {
    browser
      .openFile('contracts/3_Ballot.sol')
      .click('[data-id="compile-dropdown-trigger"]')
      .waitForElementVisible('[data-id="compile-dropdown-panel"]', 60000)
      .click('[data-id="compile-run-analysis-menu-item"]')
      .waitForElementVisible('[data-id="compile-run-analysis-menu-item-panel"]', 60000)
      .click('[data-id="run-solidity-scan-submenu-item"]')
      .waitForElementVisible('[data-id="SolidityScanPermissionHandlerModalDialogModalTitle-react"]', 60000)
      .waitForElementVisible('[data-id="SolidityScanPermissionHandler-modal-footer-ok-react"]', 60000)
      .click('[data-id="SolidityScanPermissionHandler-modal-footer-ok-react"]')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'Scan Summary:', 60000)
      .verifyContracts(['Ballot'])
  }
}
