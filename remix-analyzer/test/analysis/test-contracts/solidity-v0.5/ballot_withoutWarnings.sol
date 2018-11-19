pragma solidity >=0.4.9 <0.6.0;

/// @title Voting with delegation.
contract Ballot {

    struct Proposal
    {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal)
    {
        winningProposal = 0;
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() public view
            returns (bytes32 winnerName)
    {
        winnerName = proposals[winningProposal()].name;
    }
}
