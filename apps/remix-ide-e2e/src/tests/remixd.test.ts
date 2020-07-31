'use strict'
import { NightwatchBrowser } from "nightwatch"
import init from '../helpers/init'
import sauce from './sauce'

const assetsTestContract = `import "./contract.sol";
contract Assets {
    uint[] proposals;
    function add(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
`

const gmbhTestContract = `contract gmbh {
    uint[] proposals;
    function register(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
`
const sources = [
  {
    'localhost/folder1/contract2.sol': {content: 'contract test2 { function get () public returns (uint) { return 11; }}'}
  },
  {
    'localhost/src/gmbh/company.sol': {content: assetsTestContract}
  },
  {
    'localhost/src/gmbh/company.sol': {content: assetsTestContract},
    'localhost/src/gmbh/contract.sol': {content: gmbhTestContract}
  },
  {
    'browser/test_import_node_modules.sol': {content: 'import "openzeppelin-solidity/contracts/math/SafeMath.sol";'}
  },
  {
    'browser/test_import_node_modules_with_github_import.sol': {content: 'import "openzeppelin-solidity/contracts/sample.sol";'}
  }
]

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Remixd': function (browser) {
    runTests(browser)
  },
  'Import from node_modules ': function (browser) {
    /*
      when a relative import is used (i.e import "openzeppelin-solidity/contracts/math/SafeMath.sol")
      remix (as well as truffle) try to resolve it against the node_modules and installed_contracts folder.
    */

    browser.waitForElementVisible('#icon-panel', 2000)
    .clickLaunchIcon('fileExplorers')
    .addFile('test_import_node_modules.sol', sources[3]['browser/test_import_node_modules.sol'])
    .clickLaunchIcon('solidity')
    .testContracts('test_import_node_modules.sol', sources[3]['browser/test_import_node_modules.sol'], ['SafeMath'])
  },
  'Import from node_modules and reference a github import': function (browser) {
    browser.waitForElementVisible('#icon-panel', 2000)
    .clickLaunchIcon('fileExplorers')
    .addFile('test_import_node_modules_with_github_import.sol', sources[4]['browser/test_import_node_modules_with_github_import.sol'])
    .clickLaunchIcon('solidity')
    .setSolidityCompilerVersion('soljson-v0.6.2+commit.bacdbe57.js') // open-zeppelin moved to pragma ^0.6.0
    .testContracts('test_import_node_modules_with_github_import.sol', sources[4]['browser/test_import_node_modules_with_github_import.sol'], ['ERC20', 'test11'])
    .clickLaunchIcon('pluginManager')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_remixd"] button')
    .end()
  },
  tearDown: sauce
}

function runTests (browser: NightwatchBrowser) {
  const browserName = browser.options.desiredCapabilities.browserName
  if (browserName === 'safari' || browserName === 'internet explorer') {
    console.log('do not run remixd test for ' + browserName + ': sauce labs doesn\'t seems to handle websocket')
    browser.end()
    return
  }

  browser
    .waitForElementVisible('#icon-panel', 2000)
    .clickLaunchIcon('fileExplorers')
    .clickLaunchIcon('pluginManager')
    .scrollAndClick('#pluginManager article[id="remixPluginManagerListItem_remixd"] button')
    .waitForElementVisible('#modal-footer-ok', 2000)
    .pause(2000)
    .click('#modal-footer-ok')
    .clickLaunchIcon('fileExplorers')
    .waitForElementVisible('[data-path="localhost/folder1"]')
    .click('[data-path="localhost/folder1"]')
    .waitForElementVisible('[data-path="localhost/contract1.sol"]')
    .assert.containsText('[data-path="localhost/contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="localhost/contract2.sol"]', 'contract2.sol')
    .waitForElementVisible('[data-path="localhost/folder1/contract1.sol"]')
    .assert.containsText('[data-path="localhost/folder1/cont ract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="localhost/folder1/contract2.sol"]', 'contract2.sol') // load and test sub folder
    .click('[data-path="localhost/folder1/contract2.sol"]')
    .click('[data-path="localhost/folder1/contract1.sol"]') // open localhost/folder1/contract1.sol
    .pause(1000)
    .testEditorValue('contract test1 { function get () returns (uint) { return 10; }}') // check the content and replace by another
    .setEditorValue('contract test1Changed { function get () returns (uint) { return 10; }}')
    .testEditorValue('contract test1Changed { function get () returns (uint) { return 10; }}')
    .setEditorValue('contract test1 { function get () returns (uint) { return 10; }}')
    .click('[data-path="localhost/folder1/contract_' + browserName + '.sol"]') // rename a file and check
    .pause(1000)
    .renameFile('localhost/folder1/contract_' + browserName + '.sol', 'renamed_contract_' + browserName + '.sol', 'localhost/folder1/renamed_contract_' + browserName + '.sol')
    .pause(1000)
    .removeFile('localhost/folder1/contract_' + browserName + '_toremove.sol')
    .perform(function (done) {
      testImportFromRemixd(browser, () => { done() })
    })
    .clickLaunchIcon('fileExplorers')
    .waitForElementVisible('[data-path="localhost/folder1"]')
    .click('[data-path="localhost/folder1"]')
    .click('[data-path="localhost/folder1"]') // click twice because remixd does not return nested folder details after update
    .waitForElementVisible('[data-path="localhost/folder1/contract1.sol"]')
    .waitForElementVisible('[data-path="localhost/folder1/renamed_contract_' + browserName + '.sol"]') // check if renamed file is preset
    .waitForElementNotPresent('[data-path="localhost/folder1/contract_' + browserName + '.sol"]') // check if renamed (old) file is not present
    .waitForElementNotPresent('[data-path="localhost/folder1/contract_' + browserName + '_toremove.sol"]') // check if removed (old) file is not present
    .click('[data-path="localhost/folder1/renamed_contract_' + browserName + '.sol"]')
}

function testImportFromRemixd (browser: NightwatchBrowser, callback: VoidFunction) {
  browser
    .waitForElementVisible('[data-path="localhost/src"]', 100000)
    .click('[data-path="localhost/src"]')
    .waitForElementVisible('[data-path="localhost/src/gmbh"]', 100000)
    .click('[data-path="localhost/src/gmbh"]')
    .waitForElementVisible('[data-path="localhost/src/gmbh/company.sol"]', 100000)
    .click('[data-path="localhost/src/gmbh/company.sol"]')
    .pause(1000)
    .verifyContracts(['Assets', 'gmbh'])
    .perform(() => { callback() })
}
