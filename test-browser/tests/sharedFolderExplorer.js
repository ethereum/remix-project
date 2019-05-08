'use strict'
var contractHelper = require('../helpers/contracts')
var init = require('../helpers/init')
var sauce = require('./sauce')

var assetsTestContract = `import "./contract.sol";
contract Assets {
    uint[] proposals;
    function add(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
`

var gmbhTestContract = `contract gmbh {
    uint[] proposals;
    function register(uint8 _numProposals) public {
        proposals.length = _numProposals;
    }
}
`
var sources = [
  {
    'localhost/folder1/contract2.sol': {content: 'contract test2 { function get () public returns (uint) { return 11; }}'}
  },
  {
    'localhost/src/gmbh/company.sol': {content: assetsTestContract}
  },
  {
    'localhost/src/gmbh/company.sol': {content: assetsTestContract},
    'localhost/src/gmbh/contract.sol': {content: gmbhTestContract}
  }
]

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'SharedFolderExplorer': function (browser) {
    runTests(browser)
  },
  tearDown: sauce
}

function runTests (browser, testData) {
  browser.testFunction = contractHelper.testFunction
  browser.clickFunction = contractHelper.clickFunction
  browser.setEditorValue = contractHelper.setEditorValue
  browser.modalFooterOKClick = contractHelper.modalFooterOKClick
  browser.getEditorValue = contractHelper.getEditorValue
  browser.testEditorValue = contractHelper.testEditorValue
  browser.clickLaunchIcon = contractHelper.clickLaunchIcon
  var browserName = browser.options.desiredCapabilities.browserName
  if (browserName === 'safari' || browserName === 'internet explorer') {
    console.log('do not run remixd test for ' + browserName + ': sauce labs doesn\'t seems to handle websocket')
    browser.end()
    return
  }
  if (browserName === 'chrome') {
    console.log('do not run remixd test for ' + browserName + ': TODO to reenable later')
    browser.end()
    return
  }
  if (browserName === 'firefox') {
    console.log('do not run remixd test for ' + browserName + ': TODO to reenable later')
    browser.end()
    return
  }
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .click('.websocketconn')
    .waitForElementVisible('#modal-footer-ok', 10000)
    .click('#modal-footer-ok')
    .waitForElementVisible('[data-path="localhost"]', 100000)
    .click('[data-path="localhost"]')
    .waitForElementVisible('[data-path="localhost/folder1"]')
    .click('[data-path="localhost/folder1"]')
    .waitForElementVisible('[data-path="localhost/contract1.sol"]')
    .assert.containsText('[data-path="localhost/contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="localhost/contract2.sol"]', 'contract2.sol')
    .waitForElementVisible('[data-path="localhost/folder1/contract1.sol"]')
    .assert.containsText('[data-path="localhost/folder1/contract1.sol"]', 'contract1.sol')
    .assert.containsText('[data-path="localhost/folder1/contract2.sol"]', 'contract2.sol') // load and test sub folder
    .click('[data-path="localhost/folder1/contract2.sol"]')
    .click('[data-path="localhost/folder1/contract1.sol"]') // open localhost/folder1/contract1.sol
    .pause(1000)
    .perform(function (done) { // check the content and replace by another
      browser.testEditorValue('contract test1 { function get () returns (uint) { return 10; }}', () => {
        console.log('testEditorValue')
        done()
      })
    })
    .perform(function (done) {
      browser.setEditorValue('contract test1Changed { function get () returns (uint) { return 10; }}', () => {
        console.log('setEditorValue')
        done()
      })
    })
    .perform(function (done) {
      browser.testEditorValue('contract test1Changed { function get () returns (uint) { return 10; }}', () => {
        console.log('testEditorValue')
        done()
      })
    })
    .perform(function (done) {
      browser.setEditorValue('contract test1 { function get () returns (uint) { return 10; }}', () => {
        console.log('setEditorValue')
        done()
      })
    })
    .click('[data-path="localhost/folder1/contract_' + browserName + '.sol"]') // rename a file and check
    .pause(1000)
    .perform(function (done) {
      contractHelper.renameFile(browser, 'localhost/folder1/contract_' + browserName + '.sol', 'renamed_contract_' + browserName + '.sol',
      'localhost/folder1/renamed_contract_' + browserName + '.sol', () => {
        console.log('tested file renaming')
        done()
      })
    })
    .pause(1000)
    .perform(function (done) { // remove a file and check
      contractHelper.removeFile(browser, 'localhost/folder1/contract_' + browserName + '_toremove.sol', () => {
        console.log('tested file removing')
        done()
      })
    })
    .perform(function (done) {
      testImportFromRemixd(browser, () => { done() })
    })
    .perform(function () {
      browser.clickLaunchIcon('fileExplorers').click('[data-path="localhost"]') // collapse and expand
        .waitForElementNotVisible('[data-path="localhost/folder1"]')
        .click('[data-path="localhost"]')
        .waitForElementVisible('[data-path="localhost/folder1"]')
        .click('[data-path="localhost/folder1"]')
        .waitForElementVisible('[data-path="localhost/folder1/contract1.sol"]')
        .waitForElementVisible('[data-path="localhost/folder1/renamed_contract_' + browserName + '.sol"]') // check if renamed file is preset
        .waitForElementNotPresent('[data-path="localhost/folder1/contract_' + browserName + '.sol"]') // check if renamed (old) file is not present
        .waitForElementNotPresent('[data-path="localhost/folder1/contract_' + browserName + '_toremove.sol"]') // check if removed (old) file is not present
        .click('[data-path="localhost/folder1/renamed_contract_' + browserName + '.sol"]')
        .click('.websocketconn')
        .end()
    })
}

function testImportFromRemixd (browser, callback) {
  browser
    .waitForElementVisible('[data-path="localhost/src"]', 100000)
    .click('[data-path="localhost/src"]')
    .waitForElementVisible('[data-path="localhost/src/gmbh"]', 100000)
    .click('[data-path="localhost/src/gmbh"]')
    .waitForElementVisible('[data-path="localhost/src/gmbh/company.sol"]', 100000)
    .click('[data-path="localhost/src/gmbh/company.sol"]')
    .pause(1000)
    .perform(() => {
      contractHelper.verifyContract(browser, ['Assets', 'gmbh'], function () {
        callback()
      })
    })
}
