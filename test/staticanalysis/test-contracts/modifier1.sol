pragma solidity ^0.4.0;

contract test {
    
    address owner;

    modifier onlyOwner {
        var a = 0;
        if (msg.sender != owner)
            throw;
        _;
    }

    function b(address a) onlyOwner returns (bool) {

    }
}