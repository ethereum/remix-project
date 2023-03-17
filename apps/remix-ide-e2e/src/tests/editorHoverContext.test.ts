'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const checkEditorHoverContent = (browser: NightwatchBrowser, path: string, expectedContent: string, offsetLeft: number = 0) => {
    browser.useXpath()
        .useXpath()
        .moveToElement('//body', 0, 0) // always move away from the hover before the next test in case we hover in the same line on a different element
        .waitForElementVisible(path)
        .moveToElement(path, offsetLeft, 0)
        .useCss()
        .waitForElementContainsText('.monaco-hover-content', expectedContent).pause(1000)
}

module.exports = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done, 'http://127.0.0.1:8080', false)
    },

    'Should load the test file': function (browser: NightwatchBrowser) {
        browser.openFile('contracts')
            .openFile('contracts/3_Ballot.sol')
            .waitForElementVisible('#editorView')
            .setEditorValue(BallotWithARefToOwner)
            .pause(4000) // wait for the compiler to finish
            .scrollToLine(37)
    },
    'Should show hover over contract in editor #group1': function (browser: NightwatchBrowser) {
        const path = "//*[contains(text(),'BallotHoverTest')]"
        checkEditorHoverContent(browser, path, 'contract BallotHoverTest is BallotHoverTest')
        checkEditorHoverContent(browser, path, 'contracts/3_Ballot.sol 10:0')
        checkEditorHoverContent(browser, path, '@title Ballot')
    },
    'Should show hover over var definition in editor #group1': function (browser: NightwatchBrowser) {
        const path = "//*[@class='view-line' and contains(.,'chairperson') and contains(.,'address') and contains(.,'public')]//span//span[contains(.,'chairperson')]"
        const expectedContent = 'address public chairperson'
        checkEditorHoverContent(browser, path, expectedContent)
    },
    'Should show hover over constructor in editor #group1': function (browser: NightwatchBrowser) {
        const path: string = "//*[@class='view-line' and contains(.,'constructor') and contains(.,'bytes32') and contains(.,'memory')]//span//span[contains(.,'constructor')]"
        const expectedContent = 'Estimated creation cost: infinite gas Estimated code deposit cost:'
        checkEditorHoverContent(browser, path, expectedContent)
    },
    'Should show hover over function in editor #group1': function (browser: NightwatchBrowser) {
        browser.scrollToLine(58)
        const path: string = "//*[@class='view-line' and contains(.,'giveRightToVote(address') and contains(.,'function') and contains(.,'public')]//span//span[contains(.,'giveRightToVote')]"
        let expectedContent = 'Estimated execution cost'
        checkEditorHoverContent(browser, path, expectedContent)
        expectedContent = 'function giveRightToVote (address internal voter) public nonpayable returns ()'
        checkEditorHoverContent(browser, path, expectedContent)
        expectedContent = "@dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'"
        checkEditorHoverContent(browser, path, expectedContent)
    },
    'Should show hover over var components in editor #group1': function (browser: NightwatchBrowser) {
        browser.scrollToLine(37)
        let path = "//*[@class='view-line' and contains(.,'voters') and contains(.,'weight')]//span//span[contains(.,'voters')]"
        let expectedContent = 'mapping(address => struct BallotHoverTest.Voter) public voters'
        checkEditorHoverContent(browser, path, expectedContent, 15)
        path = "//*[@class='view-line' and contains(.,'voters') and contains(.,'weight')]//span//span[contains(.,'chairperson')]"
        expectedContent = 'address public chairperson'
        checkEditorHoverContent(browser, path, expectedContent, 3)
        path = "//*[@class='view-line' and contains(.,'voters') and contains(.,'weight')]//span//span[contains(.,'weight')]"
        expectedContent = 'uint256 internal weight'
        checkEditorHoverContent(browser, path, expectedContent)
    },
    'Should show hover over new contract creation in editor #group1': function (browser: NightwatchBrowser) {
        let path = "//*[@class='view-line' and contains(.,'Owner') and contains(.,'new')]//span//span[contains(.,'cowner')]"
        let expectedContent = 'contract Owner internal cowner'
        checkEditorHoverContent(browser, path, expectedContent, 10)
        path = "//*[@class='view-line' and contains(.,'Owner') and contains(.,'new')]//span//span[contains(.,'Owner')]"
        expectedContent = 'contract Owner is Owner'
        checkEditorHoverContent(browser, path, expectedContent, 10)
    },
    'Should show hover over external class member in editor #group1': function (browser: NightwatchBrowser) {
        const path = "//*[@class='view-line' and contains(.,'getOwner') and contains(.,'cowner')]//span//span[contains(.,'getOwner')]"
        let expectedContent = 'function getOwner () external view returns (address internal )'
        checkEditorHoverContent(browser, path, expectedContent, 0)
        expectedContent = 'contracts/2_Owner.sol'
        checkEditorHoverContent(browser, path, expectedContent, 0)
        expectedContent = '@dev Return owner address'
        checkEditorHoverContent(browser, path, expectedContent, 0)
    },
    'Should show hover over struct definition in editor #group1': function (browser: NightwatchBrowser) {
        browser.scrollToLine(5)
        const path = "//*[@class='view-line' and contains(.,'Voter') and contains(.,'struct')]//span//span[contains(.,'Voter')]"
        const expectedContent = 'StructDefinition'
        checkEditorHoverContent(browser, path, expectedContent)
    }
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BallotWithARefToOwner = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./2_Owner.sol";

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract BallotHoverTest {
   Owner cowner;
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
        cowner = new Owner();
        cowner.getOwner();
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