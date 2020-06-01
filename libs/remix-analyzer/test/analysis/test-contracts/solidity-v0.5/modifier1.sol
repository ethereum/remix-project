pragma solidity >=0.4.9 <0.6.0;

contract test {
    
    address owner;

    modifier onlyOwner {
        uint a = 0;
        if (msg.sender != owner)
            revert();
        _;
    }

    function b(address a) public onlyOwner returns (bool) {
        return true;
    }
}