module.exports = `pragma solidity ^0.5.0;

library TestsAccounts {
    function getAccount(uint index) public returns (address) {
        >accounts<
        return accounts[index];
    }
}
`
