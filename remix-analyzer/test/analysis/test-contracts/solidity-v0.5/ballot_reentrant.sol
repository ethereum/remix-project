pragma solidity >=0.4.9 <0.6.0;

contract InfoFeed {
    function info() public payable returns (uint ret);
    function call1(uint a) public payable returns (bool);
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
    
    function send1(address a) public {
        giveRightToVote(a,a);
    }
    
    /// Create a new ballot with $(_numProposals) different proposals.
    constructor(uint8 _numProposals) public {
        address payable d;

        (bool success, bytes memory data) = d.delegatecall.gas(800)(abi.encodeWithSignature('function_name', 'arg1', 'arg2'));
        if(!success) revert();
        
        (bool success2, bytes memory data2) = d.delegatecall.gas(800)(abi.encodeWithSignature('function_name', 'arg1', 'arg2'));
        if(!success2) revert();

        (bool success3, bytes memory data3) = d.call.value(10).gas(800)(abi.encodeWithSignature('function_name', 'arg1', 'arg2'));
        if(!success3) revert();

        (bool success4, bytes memory data4) = d.call.value(10).gas(800)(abi.encodeWithSignature('function_name', 'arg1', 'arg2'));
        if(!success4) revert();
        
        
        address payable o = msg.sender;
        if(!o.send(1 wei)) revert();

        (bool success5, bytes memory data5) = d.call(abi.encodeWithSignature('function_name', 'arg1', 'arg2'));
        if(!success5) revert();
        
        
        uint a = now;
        uint c = block.timestamp;
        if(block.timestamp < 100){}
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        proposals.length = _numProposals;
        if(!d.send(1 wei)) revert();
        feed.info.value(10).gas(800)();
        
        feed.call1(1);
        
        this.send1(d);
    }

  
    /// Give $(voter) the right to vote on this ballot.
    /// May only be called by $(chairperson).
    function giveRightToVote(address voter, address b) public payable returns (bool){
        if (msg.sender != chairperson || voters[voter].voted) return false;
        voters[voter].weight = 1;
        return true;
    }

    /// Delegate your vote to the voter $(to).
    function delegate(address to) public {
        Voter memory sender = voters[msg.sender]; // assigns reference
        if (sender.voted) return;
        while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
            to = voters[to].delegate;
        if (to == msg.sender) return;
        sender.voted = true;
        sender.delegate = to;
        Voter memory delegate = voters[to];
        if (delegate.voted)
            proposals[delegate.vote].voteCount += sender.weight;
        else
            delegate.weight += sender.weight;
    }

    /// Give a single vote to proposal $(proposal).
    function vote(uint8 proposal) public {
        Voter memory sender = voters[msg.sender];
        if (sender.voted || proposal >= proposals.length) return;
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() view public returns (uint8 winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 proposal = 0; proposal < proposals.length; proposal++)
            if (proposals[proposal].voteCount > winningVoteCount) {
                winningVoteCount = proposals[proposal].voteCount;
                winningProposal = proposal;
            }
    }
}
