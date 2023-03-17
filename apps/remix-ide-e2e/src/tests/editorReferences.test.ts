'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

const openReferences = (browser: NightwatchBrowser, path: string) => {
    (browser as any).useXpath()
        .useXpath()
        .waitForElementVisible(path)
        .click(path)
        .perform(function () {
            const actions = this.actions({ async: true });
            return actions.
                keyDown(this.Keys.SHIFT).
                sendKeys(this.Keys.F12)
        })
}

module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done, 'http://127.0.0.1:8080', false)
    },

    'Should load the test file': function (browser: NightwatchBrowser) {
        browser.openFile('contracts')
            .openFile('contracts/3_Ballot.sol')
            .waitForElementVisible('#editorView')
            .setEditorValue(BallotWithARefToOwner)
            .pause(10000) // wait for the compiler to finish
            .scrollToLine(37)
    },
    'Should show local references': function (browser: NightwatchBrowser) {
        browser.scrollToLine(48)
        const path = "//*[@class='view-line' and contains(.,'length') and contains(.,'proposalNames')]//span//span[contains(.,'proposalNames')]"
        openReferences(browser, path)
        browser.waitForElementVisible("//*[@class='monaco-highlighted-label referenceMatch']//span[contains(.,'length; i++')]")
        .waitForElementVisible("//*[@class='monaco-highlighted-label referenceMatch']//span[contains(.,'name:')]")
        .waitForElementVisible("//*[@class='monaco-highlighted-label referenceMatch']//span[contains(.,'constructor')]")
        .keys(browser.Keys.ESCAPE)
    },
    'Should show references of getOwner': function (browser: NightwatchBrowser) {
        browser.scrollToLine(39)
        const path = "//*[@class='view-line' and contains(.,'getOwner') and contains(.,'cowner')]//span//span[contains(.,'getOwner')]"
        openReferences(browser, path)
        browser.useXpath()
        .waitForElementVisible("//*[@class='monaco-highlighted-label']//span[contains(.,'2_Owner.sol')]")
        .waitForElementVisible("//*[@class='monaco-highlighted-label']//span[contains(.,'3_Ballot.sol')]")
        .waitForElementVisible("//*[@class='monaco-highlighted-label referenceMatch']//span[contains(.,'cowner.getOwner')]")
        .waitForElementVisible("//*[contains(@class, 'results-loaded') and contains(., 'References (2)')]")
        .keys(browser.Keys.ESCAPE)
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