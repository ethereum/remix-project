pragma solidity ^0.4.9;
contract bla {
    uint brr;
    function duper() {
        brr++;
    }
}

contract a is bla {
    
    function blub() {
        brr++;
    }
    
    function r () {
        address a;
        bytes32 hash;
        uint8 v;
        bytes32 r;
        bytes32 s;
        
        block.blockhash(1);
        block.coinbase;
        block.difficulty;
        block.gaslimit;
        block.number;
        block.timestamp;
        msg.data;
        msg.gas;
        msg.sender;
        msg.value;
        now;
        tx.gasprice;
        tx.origin;
        // assert(1 == 2);
        // require(1 == 1);
        keccak256(a);
        sha3(a);
        sha256(a);
        ripemd160(a);
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