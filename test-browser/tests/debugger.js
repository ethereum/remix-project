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
    .assert.containsText('*[data-id="solidityLocals"]', "toast")
    .assert.containsText('*[data-id="solidityLocals"]', "999")
  },

  'Should debug transaction using slider': function (browser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindudapp"]')
    .click('*[data-id="slider"]')
    .setValue('*[data-id="slider"]', 50)
    .pause(2000)
    .assert.containsText('*[data-id="solidityLocals"]', "no locals")
    .assert.containsText('*[data-id="stepdetail"]', 'vm trace step: 92')
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
