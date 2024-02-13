'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  '@sources': () => sources,
  'Should flatten contract after creation': function (browser: NightwatchBrowser) { 
    browser.addFile('TestContract.sol', sources[0]['TestContract.sol'])
      .pause(10000)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemTestContract.sol"]')
      .pause(3000)
      .click('*[data-id="treeViewLitreeViewItemTestContract.sol"]')
      .rightClick('*[data-id="treeViewLitreeViewItemTestContract.sol"]')
      .click('*[id="menuitemflattenacontract"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemTestContract_flattened.sol"]')
  },
  'Should not be able to flatten contract without imports': function (browser: NightwatchBrowser) {
    browser.click('*[data-id="treeViewLitreeViewItemcontracts"]')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .pause(1000)
      .click('*[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .rightClick('*[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .click('*[id="menuitemflattenacontract"]')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemcontracts/3_Ballot_flattened.sol"]')
  },
  'Should not flatten contract with errors in syntax': function (browser: NightwatchBrowser) {
    browser.addFile('samplecontract.sol', { content })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemsamplecontract.sol"]')
      .click('*[data-id="treeViewLitreeViewItemsamplecontract.sol"]')
      .pause(1000)
      .rightClick('*[data-id="treeViewLitreeViewItemsamplecontract.sol"]')
      .click('*[id="menuitemflattenacontract"]')
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemsamplecontract_flattened.sol"]')
  }
}

const sources = [
  {
    'TestContract.sol': {
      content: `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.20;
      
      import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
      import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
      import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
      import "@openzeppelin/contracts/access/Ownable.sol";
      import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
      
      contract MyToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
          constructor(address initialOwner)
              ERC20("MyToken", "MTK")
              Ownable(initialOwner)
              ERC20Permit("MyToken")
          {}
      
          function pause() public onlyOwner {
              _pause();
          }
      
          function unpause() public onlyOwner {
              _unpause();
          }
      
          function mint(address to, uint256 amount) public onlyOwner {
              _mint(to, amount);
          }
      
          // The following functions are overrides required by Solidity.
      
          function _update(address from, address to, uint256 value)
              internal
              override(ERC20, ERC20Pausable)
          {
              super._update(from, to, value);
          }
      }
      
      `
    },
}
]

const content = `
        // SPDX-License-Identifier: GPL-3.0

        pragma solidity >=0.7.0 <0.9.0;

        /** 
         * @title Ballot
         * @dev Implements voting process along with vote delegation
         */
        contract Voting {

            struct Voter {
                uint weight // weight is accumulated by delegation <-- missing semicolon
                bool voted  // if true, that person already voted <-- missing semicolon
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