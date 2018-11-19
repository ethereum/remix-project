module.exports = `pragma solidity ^0.5.0;

library TestsAccounts {
    function getAccount(uint index) returns (address) {
        >accounts<
        return accounts[index];
    }
}
`
