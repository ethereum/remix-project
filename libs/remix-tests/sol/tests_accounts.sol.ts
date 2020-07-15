module.exports = `
library TestsAccounts {
    function getAccount(uint index) public returns (address) {
        >accounts<
        return accounts[index];
    }
}
`
