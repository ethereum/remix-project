let Web3 = require('web3');
var EthJSVM = require('ethereumjs-vm')

// TODO: this whole file is temporary and should disapear one the code is
// refactored

function web3Instance() {
  let web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
  //var vm = new EthJSVM({
  //  enableHomestead: true,
  //  activatePrecompiles: true
  //});
  //
  //var Web3VMProvider = remixLib.vm.Web3VMProvider;
  //
  //let web3 = new Web3VMProvider();
  //web3.setVM(vm);
  return web3;
}

module.exports = web3Instance;
