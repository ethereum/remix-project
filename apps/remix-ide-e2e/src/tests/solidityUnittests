'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {

  before: function (browser: NightwatchBrowser, done) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Should launch solidity unit test plugin': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .clickLaunchIcon('fileExplorers')
      .addFile('simple_storage.sol', sources[0]['simple_storage.sol'])
      .addFile('ks2a.sol', sources[0]['ks2a.sol'])
      .clickLaunchIcon('pluginManager')
      .scrollAndClick('*[data-id="pluginManagerComponentActivateButtonsolidityUnitTesting"]')
      .click('*[data-id="verticalIconsKindsolidityUnitTesting"]')
      .waitForElementPresent('*[data-id="sidePanelSwapitTitle"]')
      .assert.containsText('*[data-id="sidePanelSwapitTitle"]', 'SOLIDITY UNIT TESTING')
  },

  'Should generate test file': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .clickLaunchIcon('fileExplorers')
      .openFile('simple_storage.sol')
      .click('*[data-id="verticalIconsKindsolidityUnitTesting"]')
      .waitForElementPresent('*[data-id="testTabGenerateTestFile"]')
      .click('*[data-id="testTabGenerateTestFile"]')
      .waitForElementPresent('*[title="tests/simple_storage_test.sol"]')
      .clickLaunchIcon('fileExplorers')
      .pause(10000)
      .openFile('tests/simple_storage_test.sol')
      .removeFile('tests/simple_storage_test.sol', 'default_workspace')
  },

  'Should run simple unit test `simple_storage_test.sol` ': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .addFile('tests/simple_storage_test.sol', sources[0]['tests/simple_storage_test.sol'])
      .click('*[data-id="verticalIconsKindsolidityUnitTesting"]')
      .waitForElementPresent('*[data-id="testTabCheckAllTests"]')
      .click('*[data-id="testTabCheckAllTests"]')
      .clickElementAtPosition('.singleTestLabel', 1)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 80000)
      .pause(5000)
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'MyTest (/tests/simple_storage_test.sol)')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✓ Initial value should be100')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✓ Value is set200')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✘ Should fail for wrong value200')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'Passing: 2')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'Failing: 1')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'FAIL MyTest (/tests/simple_storage_test.sol)')
  },

  'Should run advance unit test using natspec and experimental ABIEncoderV2 `ks2b_test.sol` ': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .clickLaunchIcon('fileExplorers')
      .addFile('tests/ks2b_test.sol', sources[0]['tests/ks2b_test.sol'])
      .click('*[data-id="verticalIconsKindsolidityUnitTesting"]')
      .waitForElementPresent('*[data-id="testTabCheckAllTests"]')
      .click('*[data-id="testTabCheckAllTests"]')
      .clickElementAtPosition('.singleTestLabel', 2)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
      .pause(5000)
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '/tests/ks2b_test.sol')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✓ Check project exists')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✘ Check wrong project owner')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✘ Check wrong sender')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✘ Check wrong value')
      .pause(5000)
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '✓ Check project is fundable')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'owner is incorrect')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'wrong sender')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'wrong value')
  },

  'Should stop unit tests during test execution` ': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .waitForElementPresent('*[data-id="testTabRunTestsTabRunAction"]')
      .clickElementAtPosition('.singleTestLabel', 0)
      .clickElementAtPosition('.singleTestLabel', 1)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .pause(5000)
      .click('*[data-id="testTabRunTestsTabStopAction"]')
    // .pause(1000)
      .assert.containsText('*[data-id="testTabRunTestsTabStopAction"]', 'Stopping')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', '/tests/ks2b_test.sol')
      .notContainsText('*[data-id="testTabSolidityUnitTestsOutput"]', '/tests/4_Ballot_test.sol')
      .notContainsText('*[data-id="testTabSolidityUnitTestsOutput"]', '/tests/simple_storage_test.sol')
      .pause(7000)
      .assert.containsText('*[data-id="testTabTestsExecutionStopped"]', 'The test execution has been stopped')
  },

  'Should fail on compilation': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .addFile('tests/compilationError_test.sol', sources[0]['compilationError_test.sol'])
      .clickLaunchIcon('fileExplorers')
      .openFile('tests/compilationError_test.sol')
      .clickLaunchIcon('solidityUnitTesting')
      .click('*[data-id="testTabCheckAllTests"]')
      .clickElementAtPosition('.singleTestLabel', 3)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutput"]')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'SyntaxError: No visibility specified')
      .assert.containsText('*[data-id="testTabTestsExecutionStoppedError"]', 'The test execution has been stopped because of error(s) in your test file')
  },

  'Should fail on deploy': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .addFile('tests/deployError_test.sol', sources[0]['tests/deployError_test.sol'])
      .clickLaunchIcon('fileExplorers')
      .openFile('tests/deployError_test.sol')
      .clickLaunchIcon('solidityUnitTesting')
      .click('*[data-id="testTabCheckAllTests"]')
      .clickElementAtPosition('.singleTestLabel', 4)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutput"]')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'contract deployment failed after trying twice')
  },

  'Should fail when parameters are to method in test contract': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .addFile('tests/methodFailure_test.sol', sources[0]['tests/methodFailure_test.sol'])
      .clickLaunchIcon('fileExplorers')
      .openFile('tests/methodFailure_test.sol')
      .clickLaunchIcon('solidityUnitTesting')
      .click('*[data-id="testTabCheckAllTests"]')
      .clickElementAtPosition('.singleTestLabel', 5)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutput"]')
      .assert.containsText('*[data-id="testTabSolidityUnitTestsOutput"]', 'Method \'add\' can not have parameters inside a test contract')
  },

  'Changing current path': function (browser: NightwatchBrowser) {
    browser
      .waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
      .addFile('myTests/simple_storage_test.sol', sources[0]['tests/simple_storage_test.sol'])
      .clickLaunchIcon('solidityUnitTesting')
      .setValue('*[data-id="uiPathInput"]', 'myTests')
      .click('*[data-id="testTabGenerateTestFolder"]')
      .clickElementAtPosition('.singleTestLabel', 0)
      .scrollAndClick('*[data-id="testTabRunTestsTabRunAction"]')
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
      .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutput"]')
      .clearValue('*[data-id="uiPathInput"]')
      .setValue('*[data-id="uiPathInput"]', 'tests')
      .click('*[data-id="testTabGenerateTestFolder"]')
  },

  'Solidity Unittests': function (browser: NightwatchBrowser) {
    runTests(browser)
  },

  tearDown: sauce
}

function runTests (browser: NightwatchBrowser) {
  browser
    .waitForElementPresent('*[data-id="verticalIconsKindfileExplorers"]')
    .clickLaunchIcon('fileExplorers')
    .click('*[data-id="treeViewLitreeViewItemcontracts"]')
    .openFile('contracts/3_Ballot.sol')
    .clickLaunchIcon('solidityUnitTesting')
    .pause(500)
    .scrollAndClick('#runTestsTabRunAction')
    .waitForElementPresent('*[data-id="testTabSolidityUnitTestsOutputheader"]', 40000)
    .waitForElementPresent('#solidityUnittestsOutput div[class^="testPass"]', 10000)
    .assert.containsText('#solidityUnittestsOutput', '/tests/4_Ballot_test.sol')
    .assert.containsText('#solidityUnittestsOutput', '✓ Check winning proposal')
    .assert.containsText('#solidityUnittestsOutput', '✓ Check winnin proposal with return value')
    .end()
}

const sources = [
  {
    'simple_storage.sol': {
      content: `
      pragma solidity >=0.4.22 <0.9.0;

      contract SimpleStorage {
        uint public storedData;
      
        constructor() {
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
    'tests/simple_storage_test.sol': {
      content: `
      pragma solidity >=0.4.22 <0.9.0;
      import "remix_tests.sol";
      import "../simple_storage.sol";

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

        function shouldFailForWrongValue200() public returns (bool) {
          foo.set(300);
          return Assert.equal(foo.get(), 200, "value is not 200");
        }
      }
        `
    },
    'ks2a.sol': {
      content: `
      pragma solidity >=0.4.22 <0.9.0;
      contract Kickstarter {
          enum State { Started, Completed }
      
          struct Project {
              address owner;
              string name;
              uint goal;
              uint fundsAvailable; // added
              uint amountContributed; // added
              State state;
              mapping(address => uint) funders; // added
          }
          uint numProjects;
          Project[] public projects;
      
          constructor() {
          }
      
          function createProject(string memory name, uint goal) public {
              projects.push(); // new line
              Project storage project = projects[projects.length - 1];
              project.name = name;
              project.goal = goal;
              project.owner = msg.sender;
              project.state = State.Started;
          }
          
          function fundProject(uint projectId) payable public {
          Project storage project = projects[projectId];
              // require project exists
              // PLEASE CHECK / or erase
              // not this: require(projects[projectId].exists, "the project must exist to be funded");
      
              // require for... underflow/overflow protection
              project.funders[msg.sender] += msg.value;
              project.amountContributed += msg.value;
              project.fundsAvailable += msg.value;
      
              if (project.amountContributed >= project.goal) {
                  project.state = State.Completed;
              }
          }
          
          // this function is here because we can't use web3 when using the VM
          function getContractBalance() public view returns(uint balance) {
              return address(this).balance;
          }
            
      }
        `
    },
    'tests/ks2b_test.sol': {
      content: `
      pragma solidity >=0.4.22 <0.9.0;
      pragma experimental ABIEncoderV2;

      import "remix_tests.sol"; // this import is automatically injected by Remix.
      import "remix_accounts.sol";
      import "../ks2a.sol";

      contract kickstarterTest {
          enum State { Started, Completed }

          Kickstarter kickstarter;
          
          function beforeAll () public {
            kickstarter = new Kickstarter();
            kickstarter.createProject("ProjectA", 123000);
            kickstarter.createProject("ProjectB", 100);
          }
      
          /// #sender: account-1
          /// #value: 10000000
          function checkProjectExists () public payable {
              (address owner, string memory name, uint goal, uint fundsAvailable, uint amountContributed, Kickstarter.State state) = kickstarter.projects(0);
              Assert.equal(name, "ProjectA", "project name is incorrect");
              Assert.equal(goal, 123000, "funding goal is incorrect");
              Assert.equal(owner, address(this), "owner is incorrect");
              Assert.equal(msg.sender, TestsAccounts.getAccount(1), "wrong sender");
              Assert.equal(msg.value, 10000000, "wrong value");
          }

          /// #sender: account-1
          /// #value: 10000000
          function checkWrongProjectOwner () public payable {
            (address owner,,,,,) = kickstarter.projects(0);
            Assert.equal(owner, TestsAccounts.getAccount(0), "owner is incorrect"); //failing case
          }

          /// #sender: account-1
          /// #value: 10000000
          function checkWrongSender () public payable {
            Assert.equal(msg.sender, TestsAccounts.getAccount(0), "wrong sender"); //failing case
          }

          /// #sender: account-1
          /// #value: 10000000
          function checkWrongValue () public payable {
            Assert.equal(msg.value, 5000000, "wrong value"); //failing case
          }

          function checkProjectIsFundable () public {
              kickstarter.fundProject{value:120000}(0);
              (address owner, string memory name, uint goal, uint fundsAvailable, uint amountContributed, Kickstarter.State state) = kickstarter.projects(0);
              Assert.equal(amountContributed, 120000, "contributed amount is incorrect");
          }
          
      }
        `
    },
    'compilationError_test.sol': {
      content: `
      pragma solidity ^0.7.0;
      
      contract failOnCompilation {
        fallback() {

        }
      }
        `
    },
    'tests/deployError_test.sol': {
      content: `
      pragma solidity ^0.7.0;

      contract failingDeploy {
          constructor() {
              revert('Deploy Failed');
          }
      }
        `
    },
    'tests/methodFailure_test.sol': {
      content: `
      pragma solidity ^0.7.0;

      contract methodfailure {
        function add(uint a, uint b) public {
           uint c = a+b;
           Assert.equal(a+b, c, "wrong value");
        }
      } 
        `
    }
  }
]
