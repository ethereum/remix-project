var name = 'gas costs: '
var desc = 'warn if the gas requiremets of functions are too high'
var categories = require('./categories')

function gasCosts () {
}

gasCosts.prototype.report = function (compilationResults) {
  var report = []
  for (var contractName in compilationResults.contracts) {
    var contract = compilationResults.contracts[contractName]
    if (
      contract.gasEstimates === undefined ||
      contract.gasEstimates.external === undefined
    ) {
      continue
    }
    var fallback = contract.gasEstimates.external['']
    if (fallback !== undefined) {
      if (fallback === null || fallback >= 2100) {
        report.push({
          warning: `Fallback function of contract ${contractName} requires too much gas (${fallback}).<br />
          If the fallback function requires more than 2300 gas, the contract cannot receive Ether.`
        })
      }
    }

    for (var functionName in contract.gasEstimates.external) {
      if (functionName === '') {
        continue
      }
      var gas = contract.gasEstimates.external[functionName]
      var gasString = gas === null ? 'unknown or not constant' : 'high: ' + gas
      if (gas === null || gas >= 3000000) {
        report.push({
          warning: `Gas requirement of function ${contractName}.${functionName} ${gasString}.<br />
          If the gas requirement of a function is higher than the block gas limit, it cannot be executed.
          Please avoid loops in your functions or actions that modify large areas of storage
          (this includes clearing or copying arrays in storage)`
        })
      }
    }
  }
  return report
}

module.exports = {
  name: name,
  description: desc,
  category: categories.GAS,
  Module: gasCosts
}
