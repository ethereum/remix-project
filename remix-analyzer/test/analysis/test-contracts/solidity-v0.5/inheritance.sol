pragma solidity >=0.4.9 <0.6.0;

contract r {
    function s() public view {}
}

contract a is r {
    uint x = 1;
    
    function getX() public view returns (uint) {
        return x;
    }
}

contract b is a {
    uint y = 2;
    uint x = 3;
    
    
    function getY(uint z, bool r) public returns (uint) {
        return y++;
    }
    
    function getY(string storage n) internal view returns (uint) { return 10; }
    
}

contract c is b {
    string x;
    
    function d() public returns (uint a, uint b) {
        //d();
        //sha3("bla");
        address payable o = msg.sender;
        o.call.gas(200000).value(address(this).balance)(abi.encode("pay()"));
        //x++;
        getY(x);
        a = getX() + getY(1, false);
        b = getX() + getY(x);
    }
}
