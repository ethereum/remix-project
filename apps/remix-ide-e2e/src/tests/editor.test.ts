'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', true)
  },

  'Should zoom in editor #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('div[data-id="mainPanelPluginsContainer"]')
      .clickLaunchIcon('filePanel')
      .waitForElementVisible('div[data-id="filePanelFileExplorerTree"]')
      .openFile('contracts')
      .openFile('contracts/1_Storage.sol')
      .waitForElementVisible('#editorView')
      .checkElementStyle('.view-lines', 'font-size', '14px')
      .click('*[data-id="tabProxyZoomIn"]')
      .click('*[data-id="tabProxyZoomIn"]')
      .checkElementStyle('.view-lines', 'font-size', '16px')
  },

  'Should zoom out editor #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('#editorView')
      .checkElementStyle('.view-lines', 'font-size', '16px')
      .click('*[data-id="tabProxyZoomOut"]')
      .click('*[data-id="tabProxyZoomOut"]')
      .checkElementStyle('.view-lines', 'font-size', '14px')
  },

  'Should display compile error in editor #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('#editorView')
      .setEditorValue(storageContractWithError + 'error')
      .pause(2000)
      .waitForElementVisible('.margin-view-overlays .fa-exclamation-square', 120000)
      .checkAnnotations('fa-exclamation-square', 29) // error
      .clickLaunchIcon('udapp')
      .checkAnnotationsNotPresent('fa-exclamation-square') // error
      .clickLaunchIcon('solidity')
      .checkAnnotations('fa-exclamation-square', 29) // error
  },

  'Should minimize and maximize codeblock in editor #group1': '' + function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('#editorView')
      .waitForElementVisible('.ace_open')
      .click('.ace_start:nth-of-type(1)')
      .waitForElementVisible('.ace_closed')
      .click('.ace_start:nth-of-type(1)')
      .waitForElementVisible('.ace_open')
  },

  'Should add breakpoint to editor #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('#editorView')
      .waitForElementNotPresent('.margin-view-overlays .fa-circle')
      .execute(() => {
        (window as any).addRemixBreakpoint(1)
      }, [], () => {})
      .waitForElementVisible('.margin-view-overlays .fa-circle')
  },

  'Should load syntax highlighter for ace light theme #group1': '' + function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('#editorView')
      .checkElementStyle('.ace_keyword', 'color', aceThemes.light.keyword)
      .checkElementStyle('.ace_comment.ace_doc', 'color', aceThemes.light.comment)
      .checkElementStyle('.ace_function', 'color', aceThemes.light.function)
      .checkElementStyle('.ace_variable', 'color', aceThemes.light.variable)
  },

  'Should load syntax highlighter for ace dark theme #group1': '' + function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('*[data-id="verticalIconsKindsettings"]')
      .click('*[data-id="verticalIconsKindsettings"]')
      .waitForElementVisible('*[data-id="settingsTabThemeLabelDark"]')
      .click('*[data-id="settingsTabThemeLabelDark"]')
      .pause(2000)
      .waitForElementVisible('#editorView')
    /* @todo(#2863) ch for class and not colors
    .checkElementStyle('.ace_keyword', 'color', aceThemes.dark.keyword)
    .checkElementStyle('.ace_comment.ace_doc', 'color', aceThemes.dark.comment)
    .checkElementStyle('.ace_function', 'color', aceThemes.dark.function)
    .checkElementStyle('.ace_variable', 'color', aceThemes.dark.variable)
    */
  },

  'Should highlight source code #group1': function (browser: NightwatchBrowser) {
    // include all files here because switching between plugins in side-panel removes highlight
    browser
      .addFile('sourcehighlight.js', sourcehighlightScript)
      .addFile('removeAllSourcehighlightScript.js', removeAllSourcehighlightScript)
      .openFile('sourcehighlight.js')
      .executeScript('remix.exeCurrent()')
      .scrollToLine(32)
      .waitForElementPresent('.highlightLine33', 60000)
      .checkElementStyle('.highlightLine33', 'background-color', 'rgb(52, 152, 219)')
      .scrollToLine(40)
      .waitForElementPresent('.highlightLine41', 60000)
      .checkElementStyle('.highlightLine41', 'background-color', 'rgb(52, 152, 219)')
      .scrollToLine(50)
      .waitForElementPresent('.highlightLine51', 60000)
      .checkElementStyle('.highlightLine51', 'background-color', 'rgb(52, 152, 219)')
  },

  'Should remove 1 highlight from source code #group1': '' + function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('li[data-id="treeViewLitreeViewItemremoveSourcehighlightScript.js"]')
      .click('li[data-id="treeViewLitreeViewItemremoveSourcehighlightScript.js"]')
      .pause(2000)
      .executeScript('remix.exeCurrent()')
      .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts"]')
      .click('li[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .click('li[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .waitForElementNotPresent('.highlightLine33', 60000)
      .checkElementStyle('.highlightLine41', 'background-color', 'rgb(52, 152, 219)')
      .checkElementStyle('.highlightLine51', 'background-color', 'rgb(52, 152, 219)')
  },

  'Should remove all highlights from source code #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementVisible('li[data-id="treeViewLitreeViewItemremoveAllSourcehighlightScript.js"]')
      .click('li[data-id="treeViewLitreeViewItemremoveAllSourcehighlightScript.js"]')
      .pause(2000)
      .executeScript('remix.exeCurrent()')
      .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .click('li[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .pause(2000)
      .waitForElementNotPresent('.highlightLine33', 60000)
      .waitForElementNotPresent('.highlightLine41', 60000)
      .waitForElementNotPresent('.highlightLine51', 60000)
  },

  'Should display the context view #group2': function (browser: NightwatchBrowser) {
    browser
      .openFile('contracts')
      .openFile('contracts/1_Storage.sol')
      .waitForElementVisible('#editorView')
      .setEditorValue(storageContractWithError)
      .pause(2000)
      .execute(() => {
        (document.getElementById('editorView') as any).gotoLine(17, 16)
      }, [], () => {})
      .waitForElementVisible('.contextview')
      .waitForElementContainsText('.contextview .type', 'FunctionDefinition')
      .waitForElementContainsText('.contextview .name', 'store')
      .execute(() => {
        (document.getElementById('editorView') as any).gotoLine(18, 12)
      }, [], () => {})
      .waitForElementContainsText('.contextview .type', 'uint256')
      .waitForElementContainsText('.contextview .name', 'number')
      .click('.contextview [data-action="previous"]') // declaration
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '180')
      })
      .click('.contextview [data-action="next"]') // back to the initial state
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '323')
      })
      .click('.contextview [data-action="next"]') // next reference
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '489')
      })
      .click('.contextview [data-action="gotoref"]') // back to the declaration
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '180')
      })
  },

  'Should display the context view, loop over "Owner" by switching file #group2': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('solidity')
      .click('[for="autoCompile"]') // disable auto compile
      .openFile('contracts')
      .openFile('contracts/3_Ballot.sol')
      .waitForElementVisible('#editorView')
      .setEditorValue(BallotWithARefToOwner)
      .clickLaunchIcon('solidity')
      .click('*[data-id="compilerContainerCompileBtn"]') // compile
      .pause(6000)
      .execute(() => {
        (document.getElementById('editorView') as any).gotoLine(14, 6)
      }, [], () => {})
      .waitForElementVisible('.contextview')
      .waitForElementContainsText('.contextview .type', 'ContractDefinition')
      .waitForElementContainsText('.contextview .name', 'Owner')
      .click('.contextview [data-action="next"]')
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '1061')
      })
      .click('.contextview [data-action="next"]')
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '153')
      })
      .currentSelectedFileIs('2_Owner.sol') // make sure the current file has been properly changed
      .click('.contextview [data-action="next"]')
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '211')
      })
      .click('.contextview [data-action="next"]')
      .currentSelectedFileIs('3_Ballot.sol')
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '1061')
      })
      .click('.contextview [data-action="gotoref"]') // go to the declaration
      .pause(1000)
      .execute(() => {
        return (document.getElementById('editorView') as any).getCursorPosition()
      }, [], (result) => {
        console.log('result', result)
        browser.assert.equal(result.value, '153')
      })
      .end()
  }
}

const aceThemes = {
  light: {
    keyword: 'rgb(147, 15, 128)',
    comment: 'rgb(35, 110, 36)',
    function: 'rgb(0, 0, 162)',
    variable: 'rgb(253, 151, 31)'
  },
  dark: {
    keyword: 'rgb(0, 105, 143)',
    comment: 'rgb(85, 85, 85)',
    function: 'rgb(0, 174, 239)',
    variable: 'rgb(153, 119, 68)'
  }
}

const sourcehighlightScript = {
  content: `
  (async () => {
    try {
        await remix.call('fileManager', 'open', 'contracts/3_Ballot.sol')
        const pos = {
            start: {
                line: 32,
                column: 3
            },
            end: {
                line: 32,
                column: 20
            }
        }
        await remix.call('editor', 'highlight', pos, 'contracts/3_Ballot.sol')
        
         const pos2 = {
            start: {
                line: 40,
                column: 3
            },
            end: {
                line: 40,
                column: 20
            }
        }
        await remix.call('editor', 'highlight', pos2, 'contracts/3_Ballot.sol')
        
         const pos3 = {
            start: {
                line: 50,
                column: 3
            },
            end: {
                line: 50,
                column: 20
            }
        }
        await remix.call('editor', 'highlight', pos3, 'contracts/3_Ballot.sol')
    } catch (e) {
        console.log(e.message)
    }
  })()
  `
}

const removeAllSourcehighlightScript = {
  content: `
  (async () => {
    try {
        await remix.call('editor', 'discardHighlight')         
    } catch (e) {
        console.log(e.message)
    }
  })()
  `
}

const storageContractWithError = `
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Storage {

    uint256 number;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }
}`

const BallotWithARefToOwner = `


// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./2_Owner.sol";

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract Ballot {
   Owner c;
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        // If you can limit the length to a certain number of bytes, 
        // always use one of bytes1 to bytes32 because they are much cheaper
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;

    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    /** 
     * @dev Create a new ballot to choose one of 'proposalNames'.
     * @param proposalNames names of proposals
     */
    constructor(bytes32[] memory proposalNames) {
        c = new Owner();
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            // 'Proposal({...})' creates a temporary
            // Proposal object and 'proposals.push(...)'
            // appends it to the end of 'proposals'.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
    
    /** 
     * @dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'.
     * @param voter address of voter
     */
    function giveRightToVote(address voter) public {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    /**
     * @dev Delegate your vote to the voter 'to'.
     * @param to address to which vote is delegated
     */
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /**
     * @dev Give your vote (including votes delegated to you) to proposal 'proposals[proposal].name'.
     * @param proposal index of proposal in the proposals array
     */
    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;

        // If 'proposal' is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    /** 
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     */
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    /** 
     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}
`
