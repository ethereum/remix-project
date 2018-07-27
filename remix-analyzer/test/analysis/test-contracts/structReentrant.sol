pragma solidity ^0.4.9;

contract Ballot {
    
    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        address delegate;
        baz foo;
    }
    
    struct baz{
        uint bar;
    }

    mapping(address => Voter) voters;
    
    /// Create a new ballot with $(_numProposals) different proposals.
    function bla(address a) {
        Voter x = voters[a];
        
        if (!a.send(10))
            throw;
            
        //voters[a] = Voter(10,true,1,a);
        //x.foo.bar *= 100;
        bli(x);
    }
    
    //function bla(){}
    
    function bli(Voter storage x) private {
        x.foo.bar++;
    }
}
