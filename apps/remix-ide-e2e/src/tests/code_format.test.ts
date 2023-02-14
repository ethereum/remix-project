'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
    'open default prettier config and set the content': function (browser: NightwatchBrowser) {
        browser.openFile('.prettierrc.json').pause(1000).setEditorValue(
            JSON.stringify(defaultPrettierOptions, null, '\t')
        )
    },
    'Add Ballot': function (browser: NightwatchBrowser) {
        browser
            .addFile('Untitled.sol', { content: unformattedContract })
    },
    'Should put cursor at "unfomattedContract"': function (browser: NightwatchBrowser) {
        const path = "//*[@class='view-line' and contains(.,'unfomattedContract')]"
        browser.waitForElementVisible('#editorView')
            .click({
                locateStrategy: 'xpath',
                selector: path
            })
    },
    'Format code': function (browser: NightwatchBrowser) {
        browser
            .perform(function () {
                const actions = this.actions({ async: true });
                return actions
                    .keyDown(this.Keys.SHIFT)
                    .keyDown(this.Keys.ALT)
                    .sendKeys('f')
            }).pause(2000)
            .getEditorValue(function (result: string) {
                browser.assert.equal(result.trim(), formattedContract)
            })
    },
    'open default prettier config and change the value of tabWdith': function (browser: NightwatchBrowser) {
        browser.openFile('.prettierrc.json').pause(1000)
            .getEditorValue(function (result: string) {
                result = result.replace(/4/g, '2')
                browser.setEditorValue(result)
            }).pause(4000)
    },
    'Should put cursor at "unfomattedContract" again': function (browser: NightwatchBrowser) {
        browser.openFile('Untitled.sol')
        const path = "//*[@class='view-line' and contains(.,'unfomattedContract')]"
        browser.waitForElementVisible('#editorView')
            .click({
                locateStrategy: 'xpath',
                selector: path
            })
    },
    'Format code with 2 tabWidth': function (browser: NightwatchBrowser) {
        browser

        .perform(function () {
            const actions = this.actions({ async: true });
            return actions
                .keyDown(this.Keys.SHIFT)
                .keyDown(this.Keys.ALT)
                .sendKeys('f')
        }).pause(2000)
        .getEditorValue(function (result: string) {
            browser.assert.equal(result.trim(), formattedWithTabWidth2)
        })
    }
}

const unformattedContract = `pragma solidity >=0.4.22 <0.9.0;
contract unfomattedContract {
   
bytes32[]       proposalNames;
                        function beforeAll () public {
proposalNames.push(bytes32("candidate1"));
                            ballotToTest = new Ballot(proposalNames);
}
}`

const formattedContract = `pragma solidity >=0.4.22 <0.9.0;

contract unfomattedContract {
    bytes32[] proposalNames;

    function beforeAll() public {
        proposalNames.push(bytes32("candidate1"));
        ballotToTest = new Ballot(proposalNames);
    }
}`

const formattedWithTabWidth2 = `pragma solidity >=0.4.22 <0.9.0;

contract unfomattedContract {
  bytes32[] proposalNames;

  function beforeAll() public {
    proposalNames.push(bytes32("candidate1"));
    ballotToTest = new Ballot(proposalNames);
  }
}`

const defaultPrettierOptions = {
    "overrides": [
        {
            "files": "*.sol",
            "options": {
                "printWidth": 80,
                "tabWidth": 4,
                "useTabs": false,
                "singleQuote": false,
                "bracketSpacing": false
            }
        },
        {
            "files": "*.yml",
            "options": {}
        },
        {
            "files": "*.yaml",
            "options": {}
        },
        {
            "files": "*.toml",
            "options": {}
        },
        {
            "files": "*.json",
            "options": {}
        },
        {
            "files": "*.js",
            "options": {}
        },
        {
            "files": "*.ts",
            "options": {}
        }
    ]
}