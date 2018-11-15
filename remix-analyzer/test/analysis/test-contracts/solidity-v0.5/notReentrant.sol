pragma solidity >=0.4.9 <0.6.0;

contract Fund {
    /// Mapping of ether shares of the contract.
    mapping(address => uint) shares;
    /// Withdraw your share.
    function withdraw() public {
        uint share = shares[msg.sender];
        shares[msg.sender] = 0;
        if (!msg.sender.send(share))
            revert();
    }
}
