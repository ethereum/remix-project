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

  'Should launch solidity unit test plugin': function (browser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
    .clickLaunchIcon('fileExplorers')
    .addFile('simple_storage.sol', sources[0]['browser/simple_storage.sol'])
    .clickLaunchIcon('pluginManager')
    .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonsolidityUnitTesting"]')
    .click('*[data-id="verticalIconsKindsolidityUnitTesting"]')
    .waitForElementPresent('*[data-id="sidePanelSwapitTitle"]')
    .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'SOLIDITY UNIT TESTING')
  },

  'Should generate test file': function (browser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
    .clickLaunchIcon('fileExplorers')
    .switchFile('browser/simple_storage.sol')
    .click('*[data-id="verticalIconsKindsolidityUnitTesting"]')
    .waitForElementPresent('*[data-id="testTabGenerateTestFile"]')
    .click('*[data-id="testTabGenerateTestFile"]')
    .waitForElementPresent('*[title="browser/test_test.sol"]')
  },

  'Should run unit test for simple_storage.sol file': function (browser) {
    browser.pause(100000)
  },

  'Solidity Unittests': function (browser) {
    runTests(browser)
  },

  tearDown: sauce
}

function runTests (browser) {
  browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .switchFile('browser/3_Ballot.sol')
    .clickLaunchIcon('solidityUnitTesting')
    .scrollAndClick('#runTestsTabRunAction')
    .pause(5000)
    .waitForElementPresent('#solidityUnittestsOutput div[class^="testPass"]')
    .pause(10000)
    .assert.containsText('#solidityUnittestsOutput', 'browser/4_Ballot_test.sol (BallotTest)')
    .assert.containsText('#solidityUnittestsOutput', '✓ (Check winning proposal)')
    .assert.containsText('#solidityUnittestsOutput', '✓ (Check winnin proposal with return value)')
    .end()
}

var sources = [
  {
    'browser/simple_storage.sol': {
      content: `
      pragma solidity >=0.4.22 <0.7.0;

      contract SimpleStorage {
        uint public storedData;
      
        constructor() public {
          storedData = 100;
        }
      
        function set(uint x) public {
          storedData = x;
        }
      
        function get() public view returns (uint retVal) {
          return storedData;
        }
      }
        `
    },
    'browser/simple_storage_test.sol': {
      content: `
      pragma solidity >=0.4.22 <0.7.0;
      import "remix_tests.sol";
      import "./simple_storage.sol";

      contract MyTest {
        SimpleStorage foo;

        function beforeEach() public {
          foo = new SimpleStorage();
        }

        function initialValueShouldBe100() public returns (bool) {
          return Assert.equal(foo.get(), 100, "initial value is not correct");
        }

        function valueIsSet200() public returns (bool) {
          foo.set(200);
          return Assert.equal(foo.get(), 200, "value is not 200");
        }
}
        `
    }
  }
]
