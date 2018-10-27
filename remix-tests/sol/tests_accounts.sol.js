module.exports = `pragma solidity ^0.4.7;

library TestsAccounts {
    function getAccount(uint index) returns (address) {
        >accounts<
        return accounts[index];
    }
}
`
