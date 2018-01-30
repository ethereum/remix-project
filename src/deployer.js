var async = require('async');

// TODO: replace this with remix's own deployer code

function deployAll(compileResult, web3, accounts, callback) {
  let compiledObject = {}, contracts = {};
  for (let contractName in compileResult) {
    let contract = compileResult[contractName];

    const regex = /(.*):(.*)/;
    const className = contractName.match(regex)[2];
    const filename = contractName.match(regex)[1];

    let abi = JSON.parse(contract.interface);
    let code = contract.bytecode;

    compiledObject[className] = {};
    compiledObject[className].abi = abi;
    compiledObject[className].code = code;
    compiledObject[className].filename = filename;
    compiledObject[className].className = className;
  }

  async.eachOfLimit(compiledObject, 1, function(contract, contractName, next) {
    let contractObject = new web3.eth.Contract(contract.abi);

    let contractCode = "0x" + contract.code;

    // TODO: temporary code, and terrible if the contracts are not in order...
    for (let name in compiledObject) {
      let contractObj = compiledObject[name];
      let linkReference = '__' + contractObj.filename + ":" + contractObj.className;
      let toReplace = linkReference + "_".repeat(40 - linkReference.length);

      if (contractCode.indexOf(linkReference) < 0) {
        continue
      }

      if (!contractObj.deployedAddress) {
        throw new Error("linking not found for " + name + " when deploying " + contractName);
      }

      contractCode = contractCode.replace(new RegExp(toReplace, "g"), contractObj.deployedAddress)
    }

    contractObject.deploy({arguments: [], data: contractCode}).send({
      from: accounts[0],
      gas: 4000 * 1000
    }).on('receipt', function(receipt) {
      contractObject.options.address = receipt.contractAddress;
      contractObject.options.from = accounts[0];
      contractObject.options.gas = 4000*1000;
      compiledObject[contractName].deployedAddress = receipt.contractAddress;

      contracts[contractName] = contractObject;

      next();
    });
  }, function() {
    callback(null, contracts);
  });
}

module.exports = {
  deployAll: deployAll
}
