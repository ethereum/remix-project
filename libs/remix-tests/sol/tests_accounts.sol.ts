module.exports = `// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.8.0;

library TestsAccounts {
    function getAccount(uint index) public returns (address) {
        >accounts<
        return accounts[index];
    }
}
`
