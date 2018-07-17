pragma solidity ^0.4.0;

contract Fund {
    /// Mapping of ether shares of the contract.
    mapping(address => uint) shares;
    /// Withdraw your share.
    function withdraw() {
        var share = shares[msg.sender];
        shares[msg.sender] = 0;
        if (!msg.sender.send(share))
            throw;
    }
}
