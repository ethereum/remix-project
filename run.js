const commander = require('commander');
const Web3 = require('web3');
const RemixTests = require('./index.js');

commander.action(function (filename) {
  let web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
  RemixTests.runTest(filename, web3);
});

if (!process.argv.slice(2).length) {
  console.log("please specify filename");
}

commander.parse(process.argv);

