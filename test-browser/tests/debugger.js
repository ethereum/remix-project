'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {

  before: function (browser, done) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should launch debugger': function (browser) {
    browser.addFile('blah.sol', sources[0]['browser/blah.sol'])
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[title="Deploy - transact (not payable)"]')
    .click('*[title="Deploy - transact (not payable)"]')
    .debugTransaction(0)
    .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'DEBUGGER')
  },

  'Should debug failing transaction': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="universalDappUiTitleExpander"]')
    .click('*[data-id="universalDappUiTitleExpander"]')
    .scrollAndClick('*[title="string name, uint256 goal"]')
    .setValue('*[title="string name, uint256 goal"]', '"toast", 999')
    .click('*[data-id="createProject - transact (not payable)"]')
    .debugTransaction(1)
    .pause(2000)
    .scrollAndClick('*[data-id="solidityLocals"]')
    .assert.containsText('*[data-id="solidityLocals"]', 'toast')
    .assert.containsText('*[data-id="solidityLocals"]', '999')
  },

  'Should debug transaction using slider': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .waitForElementVisible('*[data-id="slider"]')
    .click('*[data-id="slider"]')
    .setValue('*[data-id="slider"]', 50)
    .pause(2000)
    .assert.containsText('*[data-id="solidityLocals"]', 'no locals')
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step: 92')
  },

  'Should step back and forward transaction': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .waitForElementPresent('*[data-id="buttonNavigatorIntoBack"]')
    .scrollAndClick('*[data-id="buttonNavigatorIntoBack"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step: 91')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step: 91')
    .click('*[data-id="buttonNavigatorIntoForward"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step: 92')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step: 92')
  },

  'Should jump through breakpoints': function (browser) {
    browser.waitForElementVisible('*[data-id="editorInput"]')
    .click('.ace_gutter-cell:nth-of-type(10)')
    .click('.ace_gutter-cell:nth-of-type(20)')
    .waitForElementVisible('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
    .click('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step: 0')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step: 0')
    .click('*[data-id="buttonNavigatorJumpNextBreakpoint"]')
    .pause(2000)
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step: 140')
    .assert.containsText('*[data-id="stepdetail"]', 'execution step: 140')
  },

  /*
   * This test is using 3 differents services:
   * - Metamask for getting the transaction
   * - Source Verifier service for fetching the contract code
   * - Ropsten node for retrieving the trace and storage
   *
  */
  'Should debug Ropsten transaction with source highlighting using the source verifier service': function (browser) {
    const passphrase = process.env.account_passphrase
    const password = process.env.account_password

    browser.waitForElementPresent('*[data-id="remixIdeSidePanel"]')
    .setupMetamask(passphrase, password) // set metamask
    .click('.network-indicator__down-arrow')
    .useXpath().click("//span[text()='Ropsten Test Network']")
    .useCss().switchBrowserTab(0)
    .refresh()
    .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
    .clickLaunchIcon('pluginManager') // load debugger and source verification
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_source-verification"] button')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_debugger"] button')
    .clickLaunchIcon('udapp')
    .waitForElementPresent('*[data-id="settingsSelectEnvOptions"]')
    .click('*[data-id="settingsSelectEnvOptions"] option[id="injected-mode"]') // switch to Ropsten in udapp
    .waitForElementPresent('*[data-id="settingsNetworkEnv"]')
    .assert.containsText('*[data-id="settingsNetworkEnv"]', 'Ropsten (3) network')
    .scrollAndClick('debugger')
    .setValue('*[data-id="debuggerTransactionInput"]', '0x5db1b4212e4f83e36bf5bc306888df50f01a73708a71322bdc6f39a76a7ebdaa') // debug tx
    .waitForElementVisible('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]', 30000)
    .assert.containsText('*[data-id="stepdetail"]', 'loaded address: 0x96d87AB604AEC7FB26C2E046CA5e6eBBB9D8b74D')
    .assert.containsText('*[data-id="solidityLocals"]', 'to: 0x6C3CCC7FBA111707D5A1AAF2758E9D4F4AC5E7B1')
    .end()
  },

  tearDown: sauce
}

var sources = [
  {
    'browser/blah.sol': {
      content: `
    pragma solidity >=0.4.22 <0.6.0;

    contract Kickstarter {

        enum State { Started, Completed }

        struct Project {
            address owner;
            string name;
            uint goal;
            State state;
        }    

        Project[] public projects;    

        constructor() public {

        }    

        function createProject(string memory name, uint goal) public {
            Project storage project = projects[projects.length];
            project.name = name;
            project.owner = msg.sender;
            project.state = State.Started;
            project.goal = goal;
        }
    }
        `
    }
  }
]
