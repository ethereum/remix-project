// This mainly extracts the provider that might be
// supplied through mist.

var Web3 = require('web3');

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

module.exports = web3;
