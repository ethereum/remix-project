pragma solidity ^0.4.9;

contract r {
    function s() constant {}
}

contract a is r {
    uint x = 1;
    
    function getX() constant returns (uint) {
        return x;
    }
}

contract b is a {
    uint y = 2;
    uint x = 3;
    
    
    function getY(uint z, bool r) returns (uint) {
        return y++;
    }
    
    function getY(string storage n) internal constant returns (uint) { return 10; }
    
}

contract c is b {
    string x;
    
    function d() returns (uint a, uint b) {
        //d();
        //sha3("bla");
        msg.sender.call.gas(200000).value(this.balance)(bytes4(sha3("pay()")));
        //x++;
        getY(x);
        a = getX() + getY(1, false);
        b = getX() + getY(x);
    }
}
