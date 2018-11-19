pragma solidity >=0.4.9 <0.6.0;
contract bla {
    uint brr;
    function duper() public {
        brr++;
    }
}

contract a is bla {
    
    function blub() public {
        brr++;
    }
    
    function r ()  public payable {
        address payable a;
        bytes32 hash;
        uint8 v;
        bytes32 r;
        bytes32 s;
        
        blockhash(1);
        block.coinbase;
        block.difficulty;
        block.gaslimit;
        block.number;
        block.timestamp;
        msg.data;
        gasleft();
        msg.sender;
        msg.value;
        now;
        tx.gasprice;
        tx.origin;
        // assert(1 == 2);
        // require(1 == 1);
        keccak256(abi.encodePacked(a));
        sha256(abi.encodePacked(a));
        ripemd160(abi.encodePacked(a));
        ecrecover(hash, v, r, s);
        addmod(1, 2, 2);
        mulmod(4,4,12);
        
        a.balance;
        blub();
        a.send(a.balance);
        
        
        
        super.duper();
        //a.transfer(a.balance);
        selfdestruct(a);
        //revert();
        assert(a.balance == 0);
    }
    
}