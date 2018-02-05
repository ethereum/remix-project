var async = require('async')

// TODO: replace this with remix's own deployer code

function deployAll (compileResult, web3, callback) {
  let compiledObject = {}
  let contracts = {}
  let accounts = []

  async.waterfall([
    function getAccountList (next) {
      web3.eth.getAccounts((_err, _accounts) => {
        accounts = _accounts
        next()
      })
    },
    function getContractData (next) {
      for (let contractFile in compileResult) {
        for (let contractName in compileResult[contractFile]) {
          let contract = compileResult[contractFile][contractName]

          const className = contractName
          const filename = contractFile

          let abi = contract.abi
          let code = contract.evm.bytecode.object

          compiledObject[className] = {}
          compiledObject[className].abi = abi
          compiledObject[className].code = code
          compiledObject[className].filename = filename
          compiledObject[className].className = className

          if (contractFile.indexOf('_test.sol') >= 0) {
            compiledObject[className].isTest = true
          }
        }
      }
      next()
    },
    function determineContractsToDeploy (next) {
      let contractsToDeploy = ['Assert']
      let allContracts = Object.keys(compiledObject)

      for (let contractName of allContracts) {
        if (contractName === 'Assert') {
          continue
        }
        if (compiledObject[contractName].isTest) {
          contractsToDeploy.push(contractName)
        }
      }
      next(null, contractsToDeploy)
    },
    function deployContracts (contractsToDeploy, next) {
      async.eachOfLimit(contractsToDeploy, 1, function (contractName, index, nextEach) {
        let contract = compiledObject[contractName]
        let contractObject = new web3.eth.Contract(contract.abi)

        let contractCode = '0x' + contract.code

        // TODO: temporary code, and terrible if the contracts are not in order...
        for (let name in compiledObject) {
          let contractObj = compiledObject[name]
          let linkReference = '__' + contractObj.filename + ':' + contractObj.className
          let toReplace = linkReference + '_'.repeat(40 - linkReference.length)

          if (contractCode.indexOf(linkReference) < 0) {
            continue
          }

          if (!contractObj.deployedAddress) {
            throw new Error('linking not found for ' + name + ' when deploying ' + contractName)
          }

          contractCode = contractCode.replace(new RegExp(toReplace, 'g'), contractObj.deployedAddress.slice(2))
        }

        let deployObject = contractObject.deploy({arguments: [], data: contractCode})

        deployObject.estimateGas().then((gasValue) => {
          deployObject.send({
            from: accounts[0],
            gas: Math.ceil(gasValue * 1.1)
          }).on('receipt', function (receipt) {
            contractObject.options.address = receipt.contractAddress
            contractObject.options.from = accounts[0]
            contractObject.options.gas = 5000 * 1000
            compiledObject[contractName].deployedAddress = receipt.contractAddress

            contracts[contractName] = contractObject

            nextEach()
          })
        })
      }, function () {
        next(null, contracts)
      })
    }
  ], callback)
}

module.exports = {
  deployAll: deployAll
}
