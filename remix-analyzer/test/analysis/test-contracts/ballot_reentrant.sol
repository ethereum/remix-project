pragma solidity ^0.4.0;

contract InfoFeed {
    function info() payable returns (uint ret);
    function call1(uint a) payable returns (bool);
}


contract Ballot {
    
    InfoFeed feed;

    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        address delegate;
    }
    struct Proposal {
        uint voteCount;
    }

    address chairperson;
    mapping(address => Voter) voters;
    Proposal[] proposals;
    
    function send1(address a) {
        giveRightToVote(a,a);
    }
    
    /// Create a new ballot with $(_numProposals) different proposals.
    function Ballot(uint8 _numProposals) {
        address d;
        if(!d.delegatecall.gas(800)('function_name', 'arg1', 'arg2')) throw;
        if(!d.callcode.gas(800)('function_name', 'arg1', 'arg2')) throw;
        if(!d.call.value(10).gas(800)('function_name', 'arg1', 'arg2')) throw;
        if(!d.call.value(10).gas(800)('function_name', 'arg1', 'arg2')) throw;
        
        

        if(!msg.sender.send(1 wei)) throw;
        if(!d.call('function_name', 'arg1', 'arg2')) throw;
        
        
        uint a = now;
        uint c = block.timestamp;
        if(block.timestamp < 100){}
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        proposals.length = _numProposals;
        if(!d.send(1 wei)) throw;
        feed.info.value(10).gas(800)();
        
        feed.call1(1);
        
        this.send1(d);
    }

  
    /// Give $(voter) the right to vote on this ballot.
    /// May only be called by $(chairperson).
    function giveRightToVote(address voter, address b) payable returns (bool){
        if (msg.sender != chairperson || voters[voter].voted) return;
        voters[voter].weight = 1;
        return true;
    }

    /// Delegate your vote to the voter $(to).
    function delegate(address to) {
        Voter sender = voters[msg.sender]; // assigns reference
        if (sender.voted) return;
        while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
            to = voters[to].delegate;
        if (to == msg.sender) return;
        sender.voted = true;
        sender.delegate = to;
        Voter delegate = voters[to];
        if (delegate.voted)
            proposals[delegate.vote].voteCount += sender.weight;
        else
            delegate.weight += sender.weight;
    }

    /// Give a single vote to proposal $(proposal).
    function vote(uint8 proposal) {
        Voter sender = voters[msg.sender];
        if (sender.voted || proposal >= proposals.length) return;
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() constant returns (uint8 winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 proposal = 0; proposal < proposals.length; proposal++)
            if (proposals[proposal].voteCount > winningVoteCount) {
                winningVoteCount = proposals[proposal].voteCount;
                winningProposal = proposal;
            }
    }
}
